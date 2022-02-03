using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Storage.Code.Services
{
  public interface IEmailSender
  {
    Task SendEmailAsync(string email, string subject, string message);
  }

  public class EmailSender : IEmailSender
  {

    public IConfiguration Configuration { get; }
    private readonly string _sendGridKey;

    public EmailSender(IConfiguration configuration)
    {
      Configuration = configuration;
      _sendGridKey = Configuration["sendGridKey"];
    }

    public Task SendEmailAsync(string email, string subject, string message)
    {
      return Execute(_sendGridKey, subject, message, email);
    }

    public Task Execute(string apiKey, string subject, string message, string email)
    {
      var client = new SendGridClient(apiKey);
      var msg = new SendGridMessage
      {
        From = new EmailAddress("sweetkeys.no.replay@gmail.com", "Sweetkeys"),
        Subject = subject,
        PlainTextContent = message,
        HtmlContent = message
      };
      msg.AddTo(new EmailAddress(email));
      return client.SendEmailAsync(msg);
    }
  }
}
