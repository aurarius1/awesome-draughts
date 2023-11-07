using backend.Game;
using System.Net.WebSockets;

namespace backend.Commands
{
    public class InitCommand : ICommand
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


        private string _name;
        private string _color; 

        public InitCommand(WebSocket socket, IGameCache gameCache, params string[] arguments)
        {
            this._CommandValid = true;
            this._CommandType = typeof(InitCommand);

            if(arguments.Length == 2)
            {
                this._name = arguments[0];
                this._color = arguments[1];
                if(this._color != "white" && this._color != "black")
                {
                    this._color = "white";
                }
            }
            else
            {
                this._CommandValid = false;
                return;
            }


            this._cache = gameCache;
            this._webSocket = socket;
        }
        public Response HandleCommand()
        {
            if(!this._CommandValid)
            {
                return new Response(ResponseTypes.InvalidArguments);
            }


            string clientId = "";
            string gameId = Guid.NewGuid().ToString();

            if (!this._cache.TryAddClient(gameId, this._webSocket, this._name, this._color, out clientId))
            {
                return new Response(ResponseTypes.InvalidArguments);
            }
            return new Response(ResponseTypes.InitOk, 
                new ResponseParam(ResponseKeys.GID, gameId), 
                new ResponseParam(ResponseKeys.CID, clientId)
            );
        }
    }
}
