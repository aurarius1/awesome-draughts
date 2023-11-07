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

        private readonly string _gameId;
        private string _name;

        public JoinCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(InitCommand);

            if(arguments.Length != 2)
            {
                _CommandValid = false;
            }
            
            this._gameId = arguments[0];
            this._name = arguments[1];
            this._cache = gameCache;
            this._webSocket = socket;
        }
        public Response HandleCommand()
        {
            if (!this._CommandValid)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            if (!this._cache.AddSecondPlayer(this._gameId, this._webSocket, this._name))
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            return new Response(ResponseTypes.GameStarted, new ResponseParam(ResponseKeys.GAME_STATE, this._cache.Get(this._gameId).GetGameState()));
        }
    }
}
