using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Net;
using System.Net.Sockets;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using NewRelic;

namespace core.Controllers
{
    [Route("core/[controller]")]
    [ApiController]
    public class PaymentProcessorController : ControllerBase
    {
        // GET core/PaymentProcessor 
        [HttpGet]
        public ActionResult<IEnumerable<string>> Get()
        {
            AddDefaultHeaders();
            return Ok(new { online = true });
        }

        // POST core/PaymentProcessor
        [HttpPost]
        public ActionResult<IEnumerable<string>> Post([FromForm] string value)
        {
            // Determinamos a qué autorizador enviaremos el pago
            string authorizer = GetAuthorizer();

            // Construimos el mensaje ISO 8583
            string iso8583 = "020042000400000000021612345678901234560609173030123456789ABC1000123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789";

            // Enviamos el mensaje al autorizador
            string response = SendToAuthorizer(authorizer, iso8583);
            
            // Simulamos un tiempo de espera de hasta 5 segundos
            int delay = new Random().Next(1, 5);
            Thread.Sleep(delay * 1000);

            // Con base en la respuesta, determinamos el estatus a devolver
            string status = GetStatusFromAuthorizerResponse(response);

            // New Relic - Custom Attributes
            NewRelic.Api.Agent.NewRelic.AddCustomParameter("authorizer", authorizer);
            NewRelic.Api.Agent.NewRelic.AddCustomParameter("status", status);
            NewRelic.Api.Agent.NewRelic.AddCustomParameter("delay", delay);

            // New Relic - Custom Event
            var eventAttributes = new Dictionary<string, object>() {
                { "status", status },
                { "authorizer", authorizer },
                { "delay", (Single)delay } ,
                { "iso8583", iso8583} };
            NewRelic.Api.Agent.NewRelic.RecordCustomEvent("AuthorizerResponse", eventAttributes);

            AddDefaultHeaders();
            return Ok(new { success = true, status = status, delay = delay });
        }

        protected void AddDefaultHeaders()
        {
            string hostname = System.Environment.GetEnvironmentVariable("HOSTNAME", EnvironmentVariableTarget.Machine);
            Response.Headers.Add("Access-Control-Allow-Origin", "*");
            Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
            Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            Response.Headers.Add("X-From-Host", hostname);
        }

        protected string GetStatusFromAuthorizerResponse(string response)
        {
            // Determinamos un estatus al azar
            string[] statuses = new string[] {
                "core:declined",
                "core:insufficient_funds",
                "core:invalid",
                "core:processed",
                "core:processed",
                "core:processed",
                "core:processed",
                "core:processed"};
            Random random = new Random();
            int i = random.Next(statuses.Count());
            string status = (string)statuses[i];
            return status;
        }

        protected string GetAuthorizer()
        {
            string[] authorizers = new string[] {
                "Santander",
                "Banorte"};
            Random random = new Random();
            int i = random.Next(authorizers.Count());
            return (string)authorizers[i];
        }

        protected string SendToAuthorizer(string authorizer, string iso)
        {

            TcpClient client = new TcpClient("tcpserver", 9000);
            NetworkStream stream = client.GetStream();
            byte[] bytesToSend = Encoding.ASCII.GetBytes(iso);
            stream.Write(bytesToSend, 0, bytesToSend.Length);

            byte[] bytesToRead = new byte[client.ReceiveBufferSize];
            int bytesRead = stream.Read(bytesToRead, 0, client.ReceiveBufferSize);
            string result = Encoding.ASCII.GetString(bytesToRead, 0, bytesRead);
            //Console.WriteLine("Received : " + result);
            //Console.ReadLine();
            client.Close();
            return result;
        }
    }
}
