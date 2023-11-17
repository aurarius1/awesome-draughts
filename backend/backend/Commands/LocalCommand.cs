using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{
    public class LocalCommand : ICommand
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

        private readonly string _nameWhite;
        private readonly string _nameBlack;

        public LocalCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(AnswerCommand);

            if(arguments.Length != 2)
            {
                _CommandValid = false;
                return;
            }
            this._nameWhite = arguments[0];
            this._nameBlack = arguments[1];
            this._cache = gameCache;
            this._webSocket = socket;
        }
        public Response HandleCommand()
        {
            if (!this._CommandValid)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }


            string clientId = "";
            string gameId = Guid.NewGuid().ToString();

            if (!this._cache.CreateLocalGame(gameId, this._webSocket, this._nameWhite, this._nameBlack, out string gameState))
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            return new Response(ResponseTypes.LocalOk,
                new ResponseParam(ResponseKeys.GAME_STATE, gameState)
            );
        }
    }
}
