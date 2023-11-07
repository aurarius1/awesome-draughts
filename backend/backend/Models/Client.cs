using System.Net.WebSockets;

namespace backend.Models
{
    public class Client
    {
        public string Id { get; set; }
        public WebSocket Socket { get; set; }

        public string Color { get; set; }
        public string Name { get; set;  }
        
        public Client(string id, WebSocket socket, string name, string color)
        {
            Id = id;
            Socket = socket;
            Name = name; 
            Color = color;
        }   
    }
}
