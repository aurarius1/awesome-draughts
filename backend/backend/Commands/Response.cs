using System.Drawing;
using backend.Models;

namespace backend.Commands
{
    public enum ResponseTypes
    {
        UnknownCommand, 
        InvalidArguments, 
        InitOk,
        JoinOk,
        GameStarted,
    }

    public enum ResponseKeys
    {
        GID = 0, 
        CID = 1,
        GAME_STATE = 2, 
        COLOR = 3,
    }

    public struct ResponseParam
    {
        private static string[] responseKeyStrings = new string[]
        {
            "gid", "cid", "game_state", "color"
        };

        public string Key { get; set;  }
        public string Value { get; set;  }

        public ResponseParam(ResponseKeys key, string value)
        {
            Key = responseKeyStrings[(int)key];
            Value = value;
        }

        public string Format()
        {
            return $"\"{Key}\": \"{Value}\"";
        }
    }

    public class Response
    {
        public string ResponseMessage { get; set; }
        public Response(ResponseTypes type)
        {
            ResponseMessage = "{0}";
            switch (type)
            {
                case ResponseTypes.InitOk:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"INIT\"{0}");
                    break;
                case ResponseTypes.JoinOk:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"JOIN\"{0}");
                    break;
                case ResponseTypes.GameStarted:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"GAME STARTED\"{0}");
                    break;
                case ResponseTypes.InvalidArguments:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"INVALID ARGUMENTS\"");
                    break;
                case ResponseTypes.UnknownCommand:
                default: 
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"UNKNOWN COMMAND\"");
                    break;
            }
        }

        public Response(ResponseTypes type, ResponseParam arg1, params ResponseParam[] args) : this(type)
        {
            string additionalParams = "," + arg1.Format(); 
            foreach(ResponseParam arg in args)
            {
                additionalParams += "," + arg.Format() ;
            }

            ResponseMessage = "{" + String.Format(ResponseMessage,additionalParams) + "}";
        }


    }

}
