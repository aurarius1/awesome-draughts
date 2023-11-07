using System.Collections.Concurrent;
using System.Net.WebSockets;
using backend.Commands;
using backend.Models;

namespace backend.Game
{

    public interface IGameCache
    {
        public Draughts Get(string gameId);
        public bool TryAddClient(string gameId, WebSocket socket, string name, string color, out string clientId);

        public bool AddSecondPlayer(string gameId, WebSocket socket, string name);
    }

    public class GameCache : IGameCache
    {
        private readonly ConcurrentDictionary<string, Draughts> _gameCache
                = new ConcurrentDictionary<string, Draughts>();


        public Draughts Get(string gameId)
        {
            if (_gameCache.TryGetValue(gameId, out var cachedGame))
            {
                return cachedGame;
            }
            throw new ThisShouldNotHappenException();
        }

        public bool TryAddClient(string gameId, WebSocket socket, string name, string color, out string clientId)
        {
            
            clientId = Guid.NewGuid().ToString(); ;
            bool added = _gameCache.TryAdd(gameId, new Draughts(gameId, new Client(clientId, socket, name, color)));
            return added;
        }

        public bool AddSecondPlayer(string gameId, WebSocket socket, string name)
        {

            string clientId = Guid.NewGuid().ToString();
            string color = "";
            Draughts? game; 
            if(!_gameCache.TryGetValue(gameId, out game))
            {
                throw new ThisShouldNotHappenException();
            }

            if(game.GameFull())
            {
                return false;
            }

            game.AddClient(clientId, socket, out color, name);
            var response = new Response(ResponseTypes.JoinOk,
                new ResponseParam(ResponseKeys.GID, gameId),
                new ResponseParam(ResponseKeys.CID, clientId),
                new ResponseParam(ResponseKeys.COLOR, color)
            );
            _ = socket.sendMessage(response.ResponseMessage);
            return true;
        }
    }
}
