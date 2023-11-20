using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{

    public class MoveCommand : ICommand
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
        private int _pieceId;
        private Position _destinationPosition;

        public MoveCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(MoveCommand);

            if(arguments.Length != 5)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
            int x = -1, y = -1;

            this._clientId = arguments[1];


            _CommandValid = 
                int.TryParse(arguments[2], out _pieceId) && 
                int.TryParse(arguments[3], out x) && 
                int.TryParse(arguments[4], out y);

            if (!_CommandValid)
            {
                return;
            }


            this._destinationPosition = new Position {x= x, y=y };
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
            if(game == null)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            if(!game.GameFull())
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            List<Position> killStreakMoves;
            string errorMessage;

            if(!game.DoMove(this._pieceId, this._destinationPosition, out killStreakMoves, out errorMessage ))
            {
                return new Response(ResponseTypes.InvalidMoveRequest, 
                            new ResponseParam(ResponseKeys.ERROR_MESSAGE, errorMessage)
                );
            }
            if(!game.IsLocalGame())
            {
                game.SendOpponentMessage(this._clientId, ResponseTypes.Sync);
            }
          
            if (killStreakMoves.Count > 0)
            {
                return new Response(ResponseTypes.MoveOk,
                    new ResponseParam(ResponseKeys.GAME_STATE, game.GetGameState()),
                    new ResponseParam(ResponseKeys.MOVES, killStreakMoves)
                );
            }
            else
            {
                return new Response(ResponseTypes.Sync, 
                    new ResponseParam(ResponseKeys.GAME_STATE, game.GetGameState())
                );
            }
        }
    }
}
