using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{

    // moves --> getFieldsToHighlight
    // move --> doMove
    public class ReconnectCommand : ICommand
    {

        private readonly IGameCache _cache;
        private readonly WebSocket _webSocket;

        private Type _CommandType;
        private Boolean _CommandValid;

        public Type CommandType
        {
            get => _CommandType;
            set => _CommandType = value;
        }

        public Boolean CommandValid
        {
            get => _CommandValid;
        }

        private readonly string _gameId;
        private readonly string _clientId;

        public ReconnectCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(ReconnectCommand);

            if(arguments.Length != 2)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
            this._clientId = arguments[1];
            this._cache = gameCache;
            this._webSocket = socket;
        }
        public Response HandleCommand()
        {
            if (!_CommandValid)
            {
                new Response(ResponseTypes.InvalidArguments);
            }
            Draughts? game = this._cache.Get(this._gameId);
            if (game == null)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }

            if(!game.Reconnect(this._clientId, this._webSocket, out string color))
            {
                return new Response(ResponseTypes.InvalidArguments);
            }

            return new Response(ResponseTypes.RECONNECT_OK,
                    new ResponseParam(ResponseKeys.GAME_STATE, game.GetGameState()),
                    new ResponseParam(ResponseKeys.COLOR, color)
            );
        }
    }
}
