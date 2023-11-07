using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Text.Json;
using System.Collections.Concurrent;
using backend.Game;
using backend.Commands;

namespace backend.Controllers
{
    [Controller]
    public class WebsocketController : ControllerBase
    {
        public readonly IGameCache _gameCache; 
        public readonly ICommandFactory _commandFactory;

        public WebsocketController(IGameCache gameCache, ICommandFactory commandFactory)
        {
            _gameCache = gameCache;
            _commandFactory = commandFactory;   
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




        private async Task Echo(WebSocket webSocket, bool initialConnection)        
        {
            var receiveResult = await webSocket.receiveMessage();
            while (!(receiveResult.Item1?.CloseStatus.HasValue ?? true))
            {

                byte[] arr = receiveResult.Item2.ToArray();
                Response response = new Commands.Response(Commands.ResponseTypes.UnknownCommand);

                if (receiveResult.Item1.MessageType == WebSocketMessageType.Text)
                {
                    string message = System.Text.Encoding.Default.GetString(arr);
         
                    ICommand command = this._commandFactory.CreateCommand(message, webSocket);
                    response = command.HandleCommand();
                }
                await webSocket.sendMessage(response.ResponseMessage);
                receiveResult = await webSocket.receiveMessage();
            }
            System.Diagnostics.Debug.WriteLine("DISCONNECT MESSAGE");
            await webSocket.CloseAsync(
                receiveResult.Item1.CloseStatus.Value,
                receiveResult.Item1.CloseStatusDescription,
                CancellationToken.None);
        }
    }
}
