using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{
    public class RenameCommand : ICommand
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
        private readonly string _name = "";
        private readonly string _name2 = ""; 

        public RenameCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(RenameCommand);

            this._cache = gameCache;
            this._webSocket = socket;

            if (arguments.Length < 3)
            {
                _CommandValid = false;
                return;
            }
            this._gameId = arguments[0];
            this._clientId = arguments[1];
            this._name = arguments[2];
            this._name2 = arguments.ElementAtOrDefault(3) ?? "";

            this._CommandValid = this._name.Length > 0;
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
            if(game.IsLocalGame())
            {
                if(this._name2.Length <= 0)
                {
                    return new Response(ResponseTypes.InvalidArguments);
                }
                game.RenamePlayer("white", this._name, true);
                game.RenamePlayer("black", this._name2, true);
            }
            else
            {
                game.RenamePlayer(this._clientId, this._name);
                game.SendOpponentMessage(this._clientId, ResponseTypes.Sync);
            }

            return new Response(ResponseTypes.Sync,
                    new ResponseParam(ResponseKeys.GAME_STATE, game.GetGameState())
                );
        }
    }
}
