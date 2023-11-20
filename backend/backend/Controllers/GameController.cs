using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;
using backend.Game;
using backend.Commands;
using Microsoft.Extensions.Localization;
using backend.Models;
using System.Text.Json;
using System.Web.Http.Results;

namespace backend.Controllers
{

    public class NotAcceptableObjectResult : ObjectResult
    {
        public NotAcceptableObjectResult(object? value) : base(value)
        {
            StatusCode = StatusCodes.Status406NotAcceptable;
        }
    }

    public class InternalServerErrorObjectResult : ObjectResult
    {
        public InternalServerErrorObjectResult() : base("")
        {
            StatusCode = StatusCodes.Status500InternalServerError;
        }
    }

    public class PaymentRequiredObjectResult : ObjectResult
    {
        public PaymentRequiredObjectResult(object? value) : base(value)
        {
            StatusCode = StatusCodes.Status402PaymentRequired;
        }
    }

    [Controller]
    public class GameController : ControllerBase
    {
        public readonly IGameCache _gameCache; 
        public readonly ICommandFactory _commandFactory;

        public GameController(IGameCache gameCache, ICommandFactory commandFactory)
        {
            _gameCache = gameCache;
            _commandFactory = commandFactory;   
        }
        [HttpPost]
        [Route("/loadGame")]
        public IActionResult Post([FromBody] SavedGame savedGame)
        {

            // TODO VALIDATION
            GameState state = savedGame.gameState;
            string serializedSaveGame = JsonSerializer.Serialize(new
            {
                state._fieldDimensions,
                _playerNames = new
                {
                    state._playerNames.white,
                    state._playerNames.black
                },
                state._history,
                state._pieces,
                state._currentPlayer,
                state._gameOver,
                state._draw,
                state._permissionRequest
            });

            if (!serializedSaveGame.VerifyGameState(savedGame.hash))
            {
                return new NotAcceptableObjectResult("INVALID_SAVE_GAME_FILE");
            }

            if(!_gameCache.TryAddGame(state, out string gameId))
            {
                return new InternalServerErrorObjectResult();
            }
            return Ok(gameId);
        }

        [HttpGet]
        [Route("/loadRemoteGame")]
        public IActionResult Get([FromQuery] string gameId)
        {
            return new PaymentRequiredObjectResult(null);
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

                if(response.ResponseType != ResponseTypes.NoResponse)
                {
                    await webSocket.sendMessage(response.ResponseMessage);
                }
                receiveResult = await webSocket.receiveMessage();
            }
            System.Diagnostics.Debug.WriteLine("DISCONNECT MESSAGE");

            string[] description = (receiveResult?.Item1?.CloseStatusDescription ?? "").Split(";");
            if(description.Length == 2)
            {
                _gameCache.EndGame(description[0], description[1]);
            }
            else
            {
                _gameCache.EndGame(webSocket);
            }
            

            await webSocket.CloseAsync(
                receiveResult.Item1.CloseStatus.Value,
                receiveResult.Item1.CloseStatusDescription,
                CancellationToken.None);
        }
    }
}
