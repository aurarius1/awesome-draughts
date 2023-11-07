using System.Net.WebSockets;
using backend.Game;

namespace backend.Commands
{
    public interface ICommand
    {
        public Type CommandType { get; set; }
        public Boolean CommandValid { get;}

        public Response HandleCommand();


    }
}
