using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using BusinessLogic.Abstractions;
using DataAccess;
using DataAccess.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BusinessLogic.Repository;
using Storage.Code;
using DataAccess.Models;
using FluentValidation.AspNetCore;
using FluentValidation;
using BusinessLogic.Models.Api;
using BusinessLogic.Models.User;
using Storage.Code.Services;
using BusinessLogic.Repository.Reports;
using BusinessLogic.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Storage.Code.Hubs;
using Storage.Middleware;

namespace Storage
{
  public class Startup
  {

    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {

      setupDependencyInjectionServices(services);

      services.AddIdentity<ApplicationUser, IdentityRole>(cfg =>
        {
          cfg.SignIn.RequireConfirmedEmail = true;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

      // ===== Add Jwt Authentication ========
      JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear(); // => remove default claims
      services.AddAuthentication(options =>
        {
          options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
          options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
          options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

        })
        .AddJwtBearer(cfg =>
        {
          cfg.RequireHttpsMetadata = false;
          cfg.SaveToken = true;
          cfg.TokenValidationParameters = new TokenValidationParameters
          {
            ValidIssuer = Configuration["JwtIssuer"],
            ValidAudience = Configuration["JwtIssuer"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JwtKey"])),
            ClockSkew = TimeSpan.Zero // remove delay of token when expire
          };
          cfg.Events = new JwtBearerEvents
          {
            OnMessageReceived = context =>
            {
              // we need to extract token for signalR servcie/
              if (context.Request.Path.Value.StartsWith("/tracker"))
              {
                var tokenValue = context.Request.Query["access_token"];
                if (tokenValue.Count > 0)
                {
                  context.Token = tokenValue;
                }
              }
              return Task.CompletedTask;
            }
          };
        });

      // ==============================

      // In production, the Angular files will be served from this directory
      services.AddSpaStaticFiles(configuration => { configuration.RootPath = "wwwroot"; });

      services.AddCors();
      services.AddControllers(cfg =>
      {
      }).AddFluentValidation()
        .AddJsonOptions(opt => opt.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull);

      services.AddAuthorization(options =>
      {
        options.AddPolicy("RequireAdmin", policy => policy.RequireRole($"{UserRole.Admin}"));
        options.AddPolicy("RequireAdminOrAssistant", policy => policy.RequireRole($"{UserRole.Admin}, {UserRole.AdminAssistant}"));
      });

      services.Configure<IISOptions>(options => { });
      services.AddResponseCompression();
      services.AddSignalR();

    }

    private void setupDependencyInjectionServices(IServiceCollection services)
    {
      var connectionString = Configuration.GetConnectionString("appConnectionString");
      services.AddSqlServer<ApplicationDbContext>(connectionString);
      services.AddTransient<IProductsRepository, ProductsRepository>();
      services.AddTransient<ICategoriesRepository, CategoriesRepository>();
      services.AddTransient<IWarehouseRepository, WarehousesRepository>();
      services.AddTransient<IOrdersRepository, OrdersRepository>();
      services.AddTransient<IClientOrdersRepository, ClientOrdersRepository>();
      services.AddTransient<ISalesPerUserRepository, SalesPerUserRepository>();
      services.AddTransient<ISalesPerProductRepository, SalesPerProductRepository>();
      services.AddTransient<IOrdersOverviewRepository, OrdersOverviewRepository>();
      services.AddTransient<IWarehouseActionsRepository, WarehouseActionsRepository>();
      services.AddTransient<IOpenOrdersRepository, OpenOrdersRepository>();

      services.AddTransient<IValidator<ApiProdAction>, ApiProdActionValidator>();
      services.AddTransient<IValidator<ApiProdTransfer>, ApiProdTransferValidator>();
      services.AddTransient<IValidator<ApiProdSell>, ApiProdSellValidator>();

      services.AddTransient<IStateService, StateService>();
      services.AddTransient<IEmailSender, EmailSender>();
      services.AddTransient<ISmsService, SmsService>();
      services.AddTransient<IStateInformer, TrackerHub>();
      services.AddTransient<TrackerHub, TrackerHub>();

      services.SetupAutoMapper();

    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ApplicationDbContext dbContext, ILoggerFactory loggerFactory)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }

      app.UseAuthentication();
      app.UseStaticFiles();
      app.UseSpaStaticFiles();


      app.UseCors(builder => builder.WithOrigins("http://localhost:1609", "http://localhost:3000", "http://localhost", "http://localhost:4200",
        "localhost:4200").AllowAnyHeader().AllowCredentials().AllowAnyMethod());

      app.UseMiddleware<ErrorHandlingMiddleware>();

      app.UseRouting();
      app.UseAuthorization();
      app.UseEndpoints(endpoints =>
      {
        endpoints.MapControllers();
        endpoints.MapHub<TrackerHub>("/tracker");
      });
      app.UseSpa(spa =>
      {
        // To learn more about options for serving an Angular SPA from ASP.NET Core,
        // see https://go.microsoft.com/fwlink/?linkid=864501

        spa.Options.SourcePath = "../../";

        if (env.IsDevelopment())
        {
          spa.UseAngularCliServer(npmScript: "start");
        }
      });
      app.UseResponseCompression();

      loggerFactory.AddFile("logs/storage-{Date}.txt");

      // ===== Create tables ======
      // dbContext.Database.EnsureCreated();
      dbContext.Database.SetCommandTimeout(300);
      dbContext.Database.Migrate();


    }
  }
}
