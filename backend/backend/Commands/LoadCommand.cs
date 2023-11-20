using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{
    public class LoadCommand : ICommand
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

        public LoadCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(LoadCommand);

            this._cache = gameCache;
            this._webSocket = socket;

            if (arguments.Length != 1)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
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

            game.AddSocketToLoadedGame(this._webSocket);

            return new Response(ResponseTypes.LoadOk,
                    new ResponseParam(ResponseKeys.GAME_STATE, game.GetGameState())
                    );
        }
    }
}
