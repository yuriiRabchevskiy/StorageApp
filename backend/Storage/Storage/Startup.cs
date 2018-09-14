using System;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
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
using System.Net.Mail;
using Storage.Code.Services;
using BusinessLogic.Repository.Reports;
using Storage.Code.Hubs;
using Microsoft.Extensions.Logging;

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
      var connectionString = Configuration.GetConnectionString("appConnectionString");
      services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(connectionString), ServiceLifetime.Transient);
      services.AddTransient<IProductsRepository, ProductsRepository>();
      services.AddTransient<ICategoriesRepository, CategoriesRepository>();
      services.AddTransient<IWarehouseRepository, WarehousesRepository>();
      services.AddTransient<IOrdersRepository, OrdersRepository>();
      services.AddTransient<ISalesPerUserRepository, SalesPerUserRepository>();
      services.AddTransient<ISalesPerProductRepository, SalesPerProductRepository>();
      services.AddTransient<IOrdersOverviewRepository, OrdersOverviewRepository>();
      services.AddTransient<IWarehouseActionsRepository, WarehouseActionsRepository>();
      services.AddTransient<IOpenOrdersRepository, OpenOrdersRepository>();

      services.AddTransient<IValidator<ApiProdAction>, ApiProdActionValidator>();
      services.AddTransient<IValidator<ApiProdTransfer>, ApiProdTransferValidator>();
      services.AddTransient<IValidator<ApiProdSell>, ApiProdSellValidator>();

      services.AddTransient<IEmailSender, EmailSender>();

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
        });

      // ==============================
      services.AddCors();
      services.AddMvc(cfg =>
        {
        }).AddFluentValidation().AddJsonOptions(opt => opt.SerializerSettings.NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore);

      services.AddAuthorization(options =>
      {
        options.AddPolicy("RequireAdmin", policy => policy.RequireRole("Admin"));
      });

      services.Configure<IISOptions>(options => { });
      //services.AddSignalR();

    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ApplicationDbContext dbContext, ILoggerFactory loggerFactory)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }

      app.UseAuthentication();

      app.UseCors(builder => builder.WithOrigins("http://localhost:1609", "http://localhost:3000", "http://localhost", "http://localhost:4200",
        "http://btv.cloudapp.net:4201", "http://btv.cloudapp.net").AllowAnyHeader().AllowCredentials().AllowAnyMethod().AllowAnyOrigin());

      //app.UseSignalR(routes =>
      //{
      //  routes.MapHub<TrackerHub>("/tracker");
      //});

      app.UseMvc();

      loggerFactory.AddFile("logs/storage-{Date}.txt");

      // ===== Create tables ======
      // dbContext.Database.EnsureCreated();
      dbContext.Database.Migrate();

      StorageConfiguration.SetupAutoMapper();
    }
  }
}
