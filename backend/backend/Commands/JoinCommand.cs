using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{
    public class JoinCommand : ICommand
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

        private readonly string _gameId = "";
        private string _name = "";

        public JoinCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(JoinCommand);

            this._cache = gameCache;
            this._webSocket = socket;

            if (arguments.Length != 2)
            {
                _CommandValid = false;
                return;
            }
            
            this._gameId = arguments[0];
            this._name = arguments[1];
        }
        public Response HandleCommand()
        {
            if (!this._CommandValid)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            if (!this._cache.AddSecondPlayer(this._gameId, this._webSocket, this._name))
            {
                return new Response(ResponseTypes.GameAborted);
            }
            Draughts? game = this._cache.Get(this._gameId);
            if (game == null)
            {
                return new Response(ResponseTypes.ServerError);
            }
            return new Response(ResponseTypes.GameStarted, new ResponseParam(ResponseKeys.GAME_STATE, game.GetGameState()));
        }
    }
}
