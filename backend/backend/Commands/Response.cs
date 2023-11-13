using System.Drawing;
using System.Text.Json;
using System.Text.Json.Serialization;
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
        InvalidMovesRequest, 
        MovesOk,
        InvalidMoveRequest,
        MoveOk,
        Sync,
        RequestSent,
        ExitOk,
    }

    public enum ResponseKeys
    {
        GID = 0, 
        CID = 1,
        GAME_STATE = 2, 
        COLOR = 3,
        NAME = 4,
        ERROR_MESSAGE = 5,
        MOVES = 6,
        MOVE = 7,
    }

    public struct ResponseParam
    {
        private static string[] responseKeyStrings = new string[]
        {
            "gid", "cid", "gameState", "color", "name", "errorMessage", "moves", "move"
        };
        public ResponseKeys ResponseType; 
        public string Key { get; set;  }
        public string Value { get; set; } = "";

        public ResponseParam(ResponseKeys key)
        {
            ResponseType = key;
            Key = responseKeyStrings[(int)key];
        }

        public ResponseParam(ResponseKeys key, string value) : this(key)
        {       
            Value = value;
        }

        public ResponseParam(ResponseKeys key, object value) : this(key)
        {
            Value = JsonSerializer.Serialize(value);
        }


        public string Format()
        {
            if(ResponseType == ResponseKeys.GAME_STATE || ResponseType == ResponseKeys.MOVES)
            {
                return $"\"{Key}\": {Value}";
            }


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
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"INIT_OK\"{0}");
                    break;
                case ResponseTypes.JoinOk:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"JOIN_OK\"{0}");
                    break;
                case ResponseTypes.GameStarted:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"GAME_STARTED\"{0}");
                    break;
                case ResponseTypes.MovesOk:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"MOVES_OK\"{0}");
                    break;
                case ResponseTypes.MoveOk:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"MOVE_OK\"{0}");
                    break;
                case ResponseTypes.Sync:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"SYNC\"{0}");
                    break;
                case ResponseTypes.InvalidMoveRequest:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"INVALID_MOVE\"{0}");
                    break;
                case ResponseTypes.InvalidMovesRequest:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"INVALID_REQUEST\"{0}");
                    break;
                case ResponseTypes.InvalidArguments:
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"INVALID_ARGUMENTS\"");
                    break;
                case ResponseTypes.UnknownCommand:
                default: 
                    ResponseMessage = String.Format(ResponseMessage, "\"state\": \"UNKNOWN_COMMAND\"");
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
