using System;
using System.IO.Pipelines;
using System.Net.WebSockets;
using System.Text.Json;
using backend.Commands;
using backend.Models;

namespace backend.Game
{
    public class Field
    {
        public Position position { get; set; }
        public bool containsPiece { get; set; } = false;
        public Piece? piece { get; set; } = null;
    }

    public class Pieces
    {
        public Pieces()
        {
            white = new();
            black = new();
        }

        public Dictionary<int, Piece> white { get; set; }
        public Dictionary<int, Piece> black { get; set; }
    }


    public enum MoveOperations
    {
        LeftTop, 
        RightTop, 
        LeftBottom, 
        RightBottom,
    } 

    public class Draughts
    {
        private string _id;
        private bool _singlePlayer = false;
        private int _fieldDimensions = 10;
        private string _currentPlayer = "white";

        private Client _player1;
        private Client? _player2 = null;

        private List<List<Field>> _field = new();
        private Pieces _pieces = new();

        public Draughts(string id, Client player1, bool singlePlayer = false)
        {
            _id = id;
            _player1 = player1;
            _singlePlayer = singlePlayer;


            for (int y = 0; y < _fieldDimensions; y++)
            {
                this._field.Add(new List<Field>());
                for (int x = 0; x < _fieldDimensions; x++)
                {
                    bool containsPiece = false;
                    Piece? piece = null;
                    Position position = new Position { x=x, y=y };
                    string pieceColor = y < _fieldDimensions / 2 ? "white" : "black";

                    if (y != _fieldDimensions / 2 && y != _fieldDimensions / 2 - 1)
                    {
                        if (x % 2 == 0)
                        {
                            containsPiece = y % 2 != 0;
                        }
                        else
                        {
                            containsPiece = y % 2 == 0;
                        }
                    }
                    if (containsPiece)
                    {
                        piece = new Piece
                        {
                            color = pieceColor,
                            id = (y * 10) + x,
                            position = position
                        };

                        if(pieceColor == "white")
                        {
                            _pieces.white.Add(piece.id, piece);
                        }
                        else
                        {
                            _pieces.black.Add(piece.id, piece);
                        }
                    }
                    Field field = new Field
                    {
                        position= position,
                        containsPiece = containsPiece,
                        piece = piece,
                    };
                    this._field[y].Add(field);
                }
            }

        }


        private Position evaluatePosition(Position? t, int offset, MoveOperations operation)
        {
            Position pos = t ?? new Position { x = -1, y = -1 };
            if (pos.x == -1 || pos.y == -1)
            {
                return new Position { x = -1, y = -1 };
            }
            
            switch (operation)
            {
                case MoveOperations.LeftTop:
                    //TopLeft
                    return new Position { x =  pos.x - offset, y = pos.y - offset};
                case MoveOperations.RightTop:
                    //TopRight
                    return new Position  { x =  pos.x + offset, y = pos.y - offset};
                case MoveOperations.LeftBottom:
                    //BottomLeft
                    return new Position  { x = pos.x - offset, y = pos.y + offset};
                case MoveOperations.RightBottom:
                    //BottomRight
                    return new Position  { x = pos.x + offset, y = pos.y + offset};
            }
            return new Position { x = -1, y = -1 };
        }


        public bool GetMoves(int pieceId, out List<Position> positions, out string errorMessage)
        {
            Piece? piece;
            positions = new();
            errorMessage = "ok";
            bool success = true;
            if (_currentPlayer == "white")
            {
                if (!_pieces.white.TryGetValue(pieceId, out piece))
                {
                    errorMessage = "something_went_wrong";
                    return false;
                }
            }
            else
            {
                if (!_pieces.black.TryGetValue(pieceId, out piece))
                {
                    errorMessage = "something_went_wrong";
                    return false;
                }
            }

            if(piece == null)
            {
                errorMessage = "something_went_wrong";
                return false;
            }
 
            foreach (MoveOperations moveOperation in Enum.GetValues(typeof(MoveOperations)))
            {
                bool hitPiece = false;
                int maxDistance = piece?.isKing ?? false ? 10 : 3;
                for(int offset = 1; offset < maxDistance; offset += 1)
                {
                    if (offset > 1 && (!piece?.isKing ?? false) && !hitPiece)
                    {
                        break;
                    }

                    Position pos = this.evaluatePosition(piece?.position, offset, moveOperation);

                    if (pos.x < 0 || pos.x > 9 || pos.y < 0 || pos.y > 9)
                    {
                        positions.Clear();
                        errorMessage = "something_went_wrong";
                        success = false;
                        break;
                    }

                    if (this._field[pos.y][pos.x].containsPiece)
                    {
                        bool notOpposing = this._field[pos.y][pos.x].piece?.color == piece?.color;
                        if (hitPiece || notOpposing)
                        {
                            break;
                        }
                        hitPiece = true;
                        continue;
                    }

                    if (offset == 1 && (!piece?.isKing ?? false))
                    {
                        if (piece?.color == "white" && (moveOperation == MoveOperations.LeftTop || moveOperation == MoveOperations.RightTop))
                            break;
                        if (piece?.color == "black" && (moveOperation == MoveOperations.LeftBottom || moveOperation == MoveOperations.RightBottom))
                            break;
                    }
                    positions.Add(pos);
                }
                if (!success)
                    break;
            }
            return success;
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
                _gameId = _id,
                _fieldDimensions = _fieldDimensions,
                _playerNames = new
                {
                    white = _player1.Color == "white" ? _player1.Name : _player2.Name,
                    black = _player1.Color == "white" ? _player2.Name : _player1.Name,
                },
                _field = _field,
                _history = "",
                _pieces = _pieces,
                _currentPlayer = _currentPlayer,
                _gameOver = false,
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
