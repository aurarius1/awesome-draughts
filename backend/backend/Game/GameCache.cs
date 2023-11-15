using System.Collections.Concurrent;
using System.Net.WebSockets;
using backend.Commands;
using backend.Models;
using Microsoft.AspNetCore.Http;

namespace backend.Game
{

    public interface IGameCache
    {
        public Draughts Get(string gameId);
        public bool TryAddClient(string gameId, WebSocket socket, string name, string color, out string clientId);
        public bool AddSecondPlayer(string gameId, WebSocket socket, string name);
        public void EndGame(string gameId, string clientId);
        public void EndGame(WebSocket socket);
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
                new ResponseParam(ResponseKeys.COLOR, color),
                new ResponseParam(ResponseKeys.NAME, name)
            );
            _ = socket.sendMessage(response.ResponseMessage);
            return true;
        }

        public void EndGame(string gameId, string clientId)
        {
            if(_gameCache.TryGetValue(gameId, out Draughts? game))
            {
                if(game.RemoveClient(clientId))
                {
                    _gameCache.Remove(gameId, out var _);
                }
            }
        }

        public void EndGame(WebSocket socket)
        {
            foreach(var game in _gameCache.Values)
            {
                if(game.ContainsPlayer(socket, out string  clientId))
                {
                    if(game.RemoveClient(clientId))
                    {
                        //_gameCache.Remove(game.GetGameId(), out var _);
                    }
                    return;
                }


            }
            return;
        }
    }
}
