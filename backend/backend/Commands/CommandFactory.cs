using System.Net.WebSockets;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Game;

namespace backend.Commands
{
    public interface ICommandFactory
    {
        ICommand CreateCommand(string socketMessage, WebSocket socket);
    }

    public class CommandFactory : ICommandFactory
    {

        private readonly IGameCache _gameCache;

        public CommandFactory(IGameCache gameCache)
        {
            _gameCache = gameCache;
        }

        public ICommand CreateCommand(string socketMessage, WebSocket socket)
        {
            var commands = socketMessage.Split(';');
            switch(commands[0])
            {
                case "init":
                    return new InitCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "join":
                    return new JoinCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "moves":
                    return new MovesCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                default:
                    return new UnknownCommand();
            }
        }
    }
}
