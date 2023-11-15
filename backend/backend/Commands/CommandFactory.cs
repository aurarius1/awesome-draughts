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
                case "move":
                    return new MoveCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "undo":
                    return new UndoCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "redo":
                    return new RedoCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "draw":
                    return new DrawCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "answer":
                    return new AnswerCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "exit":
                    return new ExitCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                case "reconnect":
                    return new ReconnectCommand(socket, this._gameCache, commands.Skip(1).ToArray());
                default:
                    return new UnknownCommand();
            }
        }
    }
}
