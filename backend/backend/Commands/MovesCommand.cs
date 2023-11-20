using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{
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

        private readonly string _gameId = ""; 
        private readonly string _clientId = "";
        private int _pieceId = -1;

        public MovesCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(MovesCommand);

            this._cache = gameCache;
            this._webSocket = socket;

            if (arguments.Length != 3)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
            this._clientId = arguments[1];
            _CommandValid = int.TryParse(arguments[2], out _pieceId);
        }
        public Response HandleCommand()
        {
            if (!this._CommandValid)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }

            Draughts? game = this._cache.Get(this._gameId);
            if (game == null)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            if (game.HasRequest())
            {
                return new Response(ResponseTypes.AnswerRequestFirst);
            }
            if (game.KillstreakActive())
            {
                return new Response(ResponseTypes.InvalidMoveRequest,
                            new ResponseParam(ResponseKeys.ERROR_MESSAGE, "on_kill_streak")
                );
            }
            if (!game.IsPlayersTurn(this._clientId, this._pieceId))
            {
                if(game.IsLocalGame())
                {
                    game.ClearNextMoves();
                }
                return new Response(ResponseTypes.NotYourTurn);
            }
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
