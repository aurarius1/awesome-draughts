using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{

    // moves --> getFieldsToHighlight
    // move --> doMove
    public class ExitCommand : ICommand
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

        public ExitCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(ExitCommand);

            if(arguments.Length != 2)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
            this._cache = gameCache;
            this._webSocket = socket;

        }
        public Response HandleCommand()
        {
            if (!_CommandValid)
            {
                new Response(ResponseTypes.InvalidArguments);
            }
            // NOTIFY OTHER ONE
            return new Response(ResponseTypes.ExitOk);
        }
    }
}
