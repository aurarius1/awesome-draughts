using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using backend.Models;
using System.Text.Json;
using System.Collections.Concurrent;

namespace backend.Controllers
{
    [Controller]
    public class WebsocketController : ControllerBase
    {
        public readonly IClientCache _clientCache; 

        public WebsocketController(IClientCache clientCache)
        {
            _clientCache = clientCache;
        }

        [Route("/ws")]
        public async Task Get()
        {
            System.Diagnostics.Debug.WriteLine("HALLO");
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await this.Echo(webSocket, true);
            }
            else
            {
                HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            }
        }
        private string ParseCommands(string command)
        {
            return "";
        }

        private async Task<System.Tuple<WebSocketReceiveResult?, List<byte>>> receiveMessage(WebSocket webSocket)
        {
            List<byte> bufferBuffer = new List<byte>();
            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult? receiveResult = null;
            do
            {
                receiveResult = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer), CancellationToken.None);

                bufferBuffer.AddRange(buffer.Take(receiveResult.Count));
            } while (!(receiveResult?.EndOfMessage ?? true));
            return Tuple.Create(receiveResult, bufferBuffer);
        }
        private async Task sendMessage(WebSocket webSocket, string message)
        {
            byte[] responseBytes = System.Text.Encoding.UTF8.GetBytes(message);

            await webSocket.SendAsync(
                    new ArraySegment<byte>(responseBytes, 0, responseBytes.Count()),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None);
        }

        private async Task Echo(WebSocket webSocket, bool initialConnection)        
        {
            var receiveResult = await receiveMessage(webSocket);
            while (!(receiveResult.Item1?.CloseStatus.HasValue ?? true))
            {

                byte[] arr = receiveResult.Item2.ToArray();
                string response = "Server hello";

                if (receiveResult.Item1.MessageType == WebSocketMessageType.Text)
                {
                    string message = System.Text.Encoding.Default.GetString(arr);
                    if(initialConnection)
                    {
                        System.Diagnostics.Debug.WriteLine("IS INITIAL CONNECTION");

                        JsonDocument? parsedMessage = message.GetJson();
                        if (parsedMessage != null)
                        {
                            SocketInitMessage? init;
                            try
                            {
                                init = JsonSerializer.Deserialize<SocketInitMessage>(parsedMessage);
                            }
                            catch(Exception ex)
                            {
                                init = null;
                            }
                            
                            if(init != null)
                            {
                                System.Diagnostics.Debug.WriteLine(init.GameId, init.ClientId);
                                response = $"Hello {init.ClientId}";
                                
                                try
                                {
                                    if (_clientCache.TryAddClient(init.GameId, init.ClientId, webSocket))
                                    {
                                        Clients? clients = _clientCache.Get(init.GameId);
                                        if (clients != null)
                                        {
                                            await sendMessage(clients.GetSocketClient1(), $"Player: {init.ClientId} joined your game :)");
                                            System.Diagnostics.Debug.WriteLine($"Adding client {init.ClientId} to game: {init.GameId}");
                                        }
                                    }
                                    else
                                    {
                                        System.Diagnostics.Debug.WriteLine("Creatiing new game with client", init.ClientId);
                                    }
                                    initialConnection = false;
                                }
                                catch(GameFull ex)
                                {
                                    response = "This game is already full, please create a new one!";
                                }
                               
                            }
                            else
                            {
                                response = "INVALID INIT MESSAGE";
                            }
                            System.Diagnostics.Debug.WriteLine("JSON");
                        }
                        else
                        {
                            System.Diagnostics.Debug.WriteLine("NO JSON");
                            response = "INVALID JSON MESSAGE";
                        }
                    }
                    System.Diagnostics.Debug.WriteLine(message);   
                }
                await sendMessage(webSocket, response);
                receiveResult = await receiveMessage(webSocket);
            }
            System.Diagnostics.Debug.WriteLine("DISCONNECT MESSAGE");
            await webSocket.CloseAsync(
                receiveResult.Item1.CloseStatus.Value,
                receiveResult.Item1.CloseStatusDescription,
                CancellationToken.None);
        }
    }
}
