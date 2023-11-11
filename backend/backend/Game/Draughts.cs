using System.Net.WebSockets;
using System.Text.Json;
using backend.Commands;
using backend.Models;

namespace backend.Game
{
    public class Draughts
    {
        private string _id;
        private bool _singlePlayer = false;

        private Client _player1;
        private Client? _player2 = null;

        public Draughts(string id, Client player1, bool singlePlayer = false)
        {
            _id = id;
            _player1 = player1;
            _singlePlayer = singlePlayer;
        }

        public bool GameFull()
        {
            return _player2 != null || _singlePlayer;
        }

        public string StartGame()
        {
            return GetGameState();
        }

        public string GetGameState()
        {
            return JsonSerializer.Serialize(new
            {
                _id = _id,
                playerNames = new
                {
                    white = _player1.Color == "white" ? _player1.Name : _player2.Name,
                    black = _player1.Color == "white" ? _player2.Name : _player1.Name,
                },
                field = "",
                history = new
                {
                    moves = "",
                    revertedMoves = ""
                },
                pieces = new
                {
                    white = "",
                    black = ""
                },
                currentPlayer = "",
            });
        }


        public void AddClient(string id, WebSocket socket, out string color, string name = "Bob")
        {
     
            color = _player1.Color == "white" ? "black" : "white";
            _player2 = new Client(id, socket, name, color);

            var response = new Response(ResponseTypes.GameStarted, 
                new ResponseParam(ResponseKeys.GAME_STATE, StartGame()));


            _ = _player1.Socket.sendMessage(response.ResponseMessage);
        }
    }
}
