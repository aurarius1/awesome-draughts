using System.Collections.Concurrent;
using System.Net.WebSockets;
using Microsoft.AspNetCore.DataProtection.KeyManagement;

namespace backend
{
    public class Clients
    {
        public Clients(string c1, WebSocket s1)
        {
            Client1 = Tuple.Create(c1, s1);
        }

        public Tuple<string, WebSocket> Client1 { 
            private get;
            set;
        }
        public Tuple<string, WebSocket>? Client2 { private get; set; } = null;



        public WebSocket GetSocketClient1()
        {
            return Client1.Item2;
        }
        public WebSocket? GetSocketClient2()
        {
            return Client2?.Item2;
        }
        public string GetIdClient1()
        {
            return Client1.Item1;
        }
        public string? GetIdClient2()
        {
            return Client2?.Item1;
        }

        public bool GameFull()
        {
            return Client2 != null;
        }

    }

    public interface IClientCache
    {
        public Clients? Get(string gameId);
        public bool TryAddClient(string gameId, string clientId, WebSocket socket);
    }

    public class ClientCache : IClientCache
    {
        private readonly ConcurrentDictionary<string, Clients> _clientCache
                = new ConcurrentDictionary<string, Clients>();


        public Clients? Get(string gameId)
        {
            if (_clientCache.TryGetValue(gameId, out var cachedClients))
            {
                return cachedClients;
            }
            return null;
        }

        public bool TryAddClient(string gameId, string clientId, WebSocket socket)
        {
            bool added = false;

            _clientCache.AddOrUpdate(gameId, new Clients(clientId, socket),
                (existingKey, existingValue) => {
                    if(existingValue.GameFull())
                    {
                        throw new GameFull("YOU SHALL NOT PASS");
                    }
                    added = true;
                    existingValue.Client2 = Tuple.Create(clientId, socket);
                    return existingValue;
                });
            return added;
        }
    }
}
