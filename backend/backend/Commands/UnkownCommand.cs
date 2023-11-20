namespace backend.Commands
{
    public class UnknownCommand : ICommand
    {
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

        public UnknownCommand()
        {
            this._CommandValid = false;
            this._CommandType = typeof(UnknownCommand);
        }

        public Response HandleCommand()
        {
            return new Response(ResponseTypes.UnknownCommand);
        }
    }
}
