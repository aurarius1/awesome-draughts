using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{

    public enum ExitType
    {
        Exit, 
        SaveLocal, 
        SaveRemote
    }


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
        private readonly string _clientId;
        private ExitType _exitType;

        public ExitCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(ExitCommand);

            if(arguments.Length != 3)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
            this._clientId = arguments[1];
            _CommandValid = Enum.TryParse(typeof(ExitType), arguments[2], out object? temp);
            if(_CommandValid)
            {
                if(temp == null)
                {
                    _CommandValid = false;
                    return;
                }
                _exitType = (ExitType)temp;
            }
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
            Response? response = null;

            switch(this._exitType)
            {
                case ExitType.Exit:
                    response = new Response(ResponseTypes.ExitOk);
                    break;
                case ExitType.SaveLocal:
                    response = new Response(ResponseTypes.SaveData,
                        new ResponseParam(ResponseKeys.GAME_STATE, game.GetGameState(true, this._clientId))    
                    );
                    break;
                case ExitType.SaveRemote:
                    response = new Response(ResponseTypes.DLC);
                    break;
            }
            if (!game.IsLocalGame())
            {
                game.SendExitRequest(this._clientId);
                // todo send other hurensohn msg;
            }
            this._cache.EndGame(this._gameId, this._clientId);
            return response;
        }
    }
}
