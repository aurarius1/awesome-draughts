using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{

    // moves --> getFieldsToHighlight
    // move --> doMove
    public class MovesCommand : ICommand
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
        private int _pieceId;

        public MovesCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(MovesCommand);

            if(arguments.Length != 2)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
            _CommandValid = int.TryParse(arguments[1], out _pieceId);
            this._cache = gameCache;
            this._webSocket = socket;

        }
        public Response HandleCommand()
        {
            if (!this._CommandValid)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }

            Draughts? game = this._cache.Get(this._gameId);


            List<Position> validMoves;
            string errorMessage;

            if(!game.GetMoves(this._pieceId, out validMoves, out errorMessage ))
            {
                return new Response(ResponseTypes.InvalidMovesRequest, 
                            new ResponseParam(ResponseKeys.ERROR_MESSAGE, errorMessage)
                );
            }

            return new Response(ResponseTypes.MovesOk,
                new ResponseParam(ResponseKeys.MOVES, validMoves)
            );
        }
    }
}
