using System.Net.WebSockets;
using System.Text.Json;
using backend.Commands;
using backend.Models;

namespace backend.Game
{
    public enum MoveOperations
    {
        LeftTop,
        RightTop,
        LeftBottom,
        RightBottom,
    }

    public enum PermissionRequest 
    {
        Nothing = 0, 
        Undo = 1, 
        Redo = 2,
        Draw = 3, 
        Exit = 4
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
        private bool _gameOver = false;
        private bool _draw = false;

        private List<Position> _nextMoves = new();
        private bool _onKillStreak = false;

        private History _history = new(); 

        public PermissionRequest _permissionRequest = PermissionRequest.Nothing;
        public string _permissionRequestee = "";

        private PlayerNames _playerNamesTemp;

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
                            id = (y * _fieldDimensions) + x,
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
                        position = position,
                        containsPiece = containsPiece,
                        pieceId = piece?.id ?? -1,
                        pieceColor = piece?.color ?? ""
                    };
                    this._field[y].Add(field);
                }
            }

        }
        public Draughts(GameState state)
        {
            this._id = state._gameId;
            this._fieldDimensions = state._fieldDimensions;
            this._pieces = state._pieces!;
            this._player1 = null!;
            for (int y = 0; y < this._fieldDimensions; y++)
            {
                this._field.Add(new());
                for (int x = 0; x < this._fieldDimensions; x++)
                {
                    this._field[y].Add(new Field
                    {
                        position = new Position { x = x, y = y },
                        containsPiece = false,
                    });


                    if (ContainsPiece(x, y, out string pieceColor, out int pieceId))
                    {
                        Piece? p = null;
                        

                        if (pieceColor == "white" && this._field[y][x] != null)
                        {
                            this._field[y][x].containsPiece = this._pieces.white.TryGetValue(pieceId, out p);
                            
                        }
                        if (pieceColor == "black" && this._field[y][x] != null)
                        {
                            this._field[y][x].containsPiece = this._pieces.black.TryGetValue(pieceId, out p);
                        }

                        if(p == null)
                        {
                            // THIS SHOULD ACTUALLY NOT HAPPEN
                            continue;
                        }

                        this._field[y][x].SetPiece(p.id, p.color);
                    }
                }
            }


            this._history = state._history!;
            this._currentPlayer = state._currentPlayer;

            this._playerNamesTemp = state._playerNames;

            this._singlePlayer = true;
        }
        private bool ContainsPiece(int x, int y, out string pieceColor, out int pieceId)
        {
            foreach(Piece piece in this._pieces.white.Values)
            {
                if(piece.position.x == x && piece.position.y == y && piece.isAlive)
                {
                    pieceColor = piece.color;
                    pieceId = piece.id;
                    return true; 
                }
            }
            foreach (Piece piece in this._pieces.black.Values)
            {
                if (piece.position.x == x && piece.position.y == y && piece.isAlive)
                {
                    pieceColor = piece.color;
                    pieceId = piece.id;
                    return true;
                }
            }

            pieceColor = "";
            pieceId = -1;
            return false;
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
        private bool GetMoves(Piece piece, bool checkForAdditionalKill, out string errorMessage)
        {
            _nextMoves.Clear();
            errorMessage = "ok";
            bool success = true;
            if (piece == null)
            {
                errorMessage = "something_went_wrong";
                return false;
            }

            foreach (MoveOperations moveOperation in Enum.GetValues(typeof(MoveOperations)))
            {
                bool hitPiece = false;
                int maxDistance = piece?.isKing ?? false ? 10 : 3;
                for (int offset = 1; offset < maxDistance; offset += 1)
                {
                    if (offset > 1 && (!piece?.isKing ?? false) && !hitPiece)
                    {
                        break;
                    }

                    Position pos = this.evaluatePosition(piece?.position, offset, moveOperation);
                    if (pos.x < 0 || pos.x > 9 || pos.y < 0 || pos.y > 9)
                    {
                        break;
                    }

                    if (this._field[pos.y][pos.x].containsPiece)
                    {
                        bool notOpposing = this._field[pos.y][pos.x].pieceColor == piece?.color;
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
                    if (checkForAdditionalKill)
                    {
                        if (hitPiece)
                        {
                            _nextMoves.Add(new Position { x = pos.x, y = pos.y });
                        }
                    }
                    else
                    {
                        _nextMoves.Add(new Position { x = pos.x, y = pos.y });
                    }
                }
                if (!success)
                    break;
            }
            return success;
        }
        private Piece? findPieceInGamefield(int pieceId)
        {
            Piece? piece;
            if(!this._pieces.white.TryGetValue(pieceId, out piece))
            {
                if(!this._pieces.black.TryGetValue(pieceId, out piece))
                {
                    return null;
                }
            }
            return piece;
        }
        public bool GetMoves(int pieceId, out List<Position> positions, out string errorMessage)
        {
            Piece? piece;
            _nextMoves.Clear();
            positions = _nextMoves;
            if (_currentPlayer == "white")
            {
                if (!_pieces.white.TryGetValue(pieceId, out piece))
                {
                    errorMessage = "wrong_color";
                    return false;
                }
            }
            else
            {
                if (!_pieces.black.TryGetValue(pieceId, out piece))
                {
                    errorMessage = "wrong_color";
                    return false;
                }
            }
            return this.GetMoves(piece, false, out errorMessage);


        }
        private int KillPiece(int deletingX, int deletingY)
        {
            int killedPiece = this._field[deletingY][deletingX].pieceId;

            if (this._field[deletingY][deletingX].pieceColor == "white")
            {
                this._pieces.white.GetValueOrDefault(killedPiece)?.Die();
            }
            else
            {
                this._pieces.black.GetValueOrDefault(killedPiece)?.Die();
            }
            this._field[deletingY][deletingX].ClearPiece();
            return killedPiece;
        }
        public bool DoMove(int pieceId, Position newPosition, out List<Position> killStreakMoves, out string errorMessage)
        {
            Piece? piece;
            errorMessage = "ok";
            killStreakMoves = new();

            if(!_nextMoves.Any( pos =>  pos.x == newPosition.x && pos.y == newPosition.y))
            {

                errorMessage = _onKillStreak ? "on_kill_streak" : "invalid_move";
                return false; 
            }


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

            if (piece == null)
            {
                errorMessage = "something_went_wrong";
                return false;
            }

            this._field[piece.position.y][piece.position.x].ClearPiece();

            this._field[newPosition.y][newPosition.x].SetPiece(piece.id, piece.color);
            int killedPiece = -1;
            bool pieceUpgraded = false;
            if (piece.isKing)
            {
                int xDiff = newPosition.x - piece.position.x;
                int yDiff = newPosition.y - piece.position.y;

                int xOffset = xDiff / Math.Abs(xDiff);
                int yOffset = yDiff / Math.Abs(yDiff);

                for (int multiplier = 1; multiplier < Math.Abs(xDiff); multiplier++)
                {
                    int deletingX = piece.position.x + (xOffset * multiplier);
                    int deletingY = piece.position.y + (yOffset * multiplier);
                    if (this._field[deletingY][deletingX].containsPiece)
                    {
                        killedPiece = KillPiece(deletingX, deletingY);
                        break;
                    }
                }
            }
            else
            {
                int xDiff = newPosition.x - piece.position.x;
                if (Math.Abs(xDiff) != 1)
                {
                    int yDiff = newPosition.y - piece.position.y;
                    int deletingX = piece.position.x + (xDiff / 2);
                    int deletingY = piece.position.y + (yDiff / 2);
                    killedPiece = KillPiece(deletingX, deletingY);
                }

                if (piece.color == "white" && newPosition.y == this._fieldDimensions - 1)
                {
                    pieceUpgraded = true;
                }
                else if (piece.color == "black" && newPosition.y == 0)
                {
                    pieceUpgraded = true;
                }

                piece.isKing = pieceUpgraded;
            }

            Move move = new Move
            {
                pieceId = pieceId,
                start = piece.position,
                end = newPosition,
                killedPieceId = killedPiece,
                pieceUpgraded = pieceUpgraded
            };
            this._history.moves.Add(move);
            this._history.revertedMoves.Clear();

            piece.position = newPosition;
            if (killedPiece != -1)
            {
                _nextMoves.Clear();
                killStreakMoves = _nextMoves;
                _onKillStreak = true;
                _ = this.GetMoves(piece, true, out errorMessage);
            }
            
            if(killStreakMoves.Count == 0)
            {
                _onKillStreak = false;

                if(_currentPlayer == "white")
                {
                    if(!this._pieces.black.Any(piece => piece.Value.isAlive))
                    {
                        _gameOver = true;
                        return true;
                    }
                    _currentPlayer = "black";
                }
                else
                {
                    if (!this._pieces.white.Any(piece => piece.Value.isAlive))
                    {
                        _gameOver = true;
                        return true;
                    }
                    _currentPlayer = "white";
                }
            }
            return true;
        }
        public bool SetRequestParameter(PermissionRequest type, string cid)
        {
            if(type == PermissionRequest.Undo)
            {
                if (this._history.moves.Count < 2)
                    return false;
            }
            if (type == PermissionRequest.Redo)
            {
                if (this._history.revertedMoves.Count < 1)
                    return false;
            }

            _permissionRequest = type;
            _permissionRequestee = cid;

            Response requestPermission = new Response(ResponseTypes.PermissionRequest,
                   new ResponseParam(ResponseKeys.REQUEST, ((int)type).ToString())
               );
            if (_player1.Id == cid)
            { 
                _player2?.Socket?.sendMessage(requestPermission.ResponseMessage);
            }
            else
            {
                _player1.Socket?.sendMessage(requestPermission.ResponseMessage);
            }
            return true;
        }
        public void AnswerRequest(bool accepted, string cid)
        {
            string requesteeColor = _player1.Id == _permissionRequestee ? _player1.Color : (_player2?.Color ?? (_player1.Color == "white" ? "black" : "white"));
            

            if(accepted)
            {
                switch(this._permissionRequest)
                {
                    case PermissionRequest.Undo:
                        if(requesteeColor == this._currentPlayer)
                        {
                            this.Undo();
                        }
                        this.Undo();
                        break;
                    case PermissionRequest.Redo:
                        this.Redo();
                        break;
                    case PermissionRequest.Draw:
                        this.Draw();
                        break;
                    case PermissionRequest.Exit:
                        break;
                }
            }



            _permissionRequest = PermissionRequest.Nothing;
            _permissionRequestee = "";

            Response requestAnswer = new Response(ResponseTypes.PermissionRequestAnswered,
                new ResponseParam(ResponseKeys.REQUEST_ANSWER, accepted.ToString())
                );
            Response sync = new Response(ResponseTypes.Sync,
                new ResponseParam(ResponseKeys.GAME_STATE, GetGameState())
                );

            if (this._player1.Id == cid)
            {
                _player2?.Socket?.sendMessage(requestAnswer.ResponseMessage);
                _player2?.Socket?.sendMessage(sync.ResponseMessage);
            }
            else
            {
                _player1.Socket?.sendMessage(requestAnswer.ResponseMessage);
                _player1.Socket?.sendMessage(sync.ResponseMessage);
            }


        }
        public void Undo()
        {
            
            Move? lastMove;
            Piece? piece;
            do
            {
                lastMove = this._history.moves.Last();
                if (lastMove == null)
                {
                    return;
                }
                this._history.moves.Remove(lastMove);
                piece = this.findPieceInGamefield(lastMove.pieceId);
                if (piece == null)
                {
                    return;
                }
                this._field[piece.position.y][piece.position.x].ClearPiece();
                piece.position = lastMove.start;
                this._field[lastMove.start.y][lastMove.start.x].SetPiece(piece.id, piece.color);


                Piece? killedPiece = this.findPieceInGamefield(lastMove.killedPieceId);
                if (killedPiece !=null)
                {
                    this._field[killedPiece.position.y][killedPiece.position.x].SetPiece(killedPiece.id, killedPiece.color);
                    killedPiece.UnDie();
                }
                if (lastMove.pieceUpgraded)
                {
                    piece.isKing = false;
                }
                this._history.revertedMoves.Add(lastMove);
            } while (piece?.id == this._history.moves.ElementAtOrDefault(this._history.moves.Count - 1)?.pieceId);

            this._currentPlayer = this._currentPlayer == "white" ? "black" : "white";
        }
        public void Redo()
        {
            Move? nextMove;
            Piece? piece;
            do
            {
                nextMove = this._history.revertedMoves.Last();
                if (nextMove == null)
                {
                    return;
                }
                this._history.revertedMoves.Remove(nextMove);
                piece = this.findPieceInGamefield(nextMove.pieceId);
                if (piece == null)
                {
                    return;
                }
                this._field[piece.position.y][piece.position.x].ClearPiece();
                piece.position = nextMove.end;
                this._field[nextMove.end.y][nextMove.end.x].SetPiece(piece.id, piece.color);


                Piece? killedPiece = this.findPieceInGamefield(nextMove.killedPieceId);
                if (killedPiece != null)
                {
                    this._field[killedPiece.position.y][killedPiece.position.x].ClearPiece();
                    killedPiece.Die();
                }
                if (nextMove.pieceUpgraded)
                {
                    piece.isKing = true;
                }
                this._history.moves.Add(nextMove);
            } while (piece?.id == this._history.revertedMoves.ElementAtOrDefault(this._history.revertedMoves.Count - 1)?.pieceId);

            this._currentPlayer = this._currentPlayer == "white" ? "black" : "white";
        }
        public void Draw()
        {
            _gameOver = true;
            _draw = true;
        }
        public bool GameFull()
        {
            return _player2 != null || _singlePlayer;
        }
        public string StartGame()
        {
            return GetGameState();
        }
        public string GetGameState(bool hashGame=false, string clientId = "")
        {
            if(hashGame)
            {
                var gameState = new
                {
                    _fieldDimensions,
                    _playerNames = new
                    {
                        white = _player1.Color == "white" ? _player1.Name : _player2?.Name,
                        black = _player1.Color == "white" ? _player2?.Name : _player1.Name,
                    },
                    _history,
                    _pieces,
                    _currentPlayer,
                    _gameOver,
                    _draw,
                    _permissionRequest = (int)_permissionRequest
                };

                return JsonSerializer.Serialize(new
                {
                    gameState = new
                    {
                        _gameId = _id,
                        _fieldDimensions,
                        _playerNames = new
                        {
                            white = _player1.Color == "white" ? _player1.Name : _player2?.Name,
                            black = _player1.Color == "white" ? _player2?.Name : _player1.Name,
                        },
                        _history,
                        _pieces,
                        _currentPlayer,
                        _gameOver,
                        _draw,
                        _permissionRequest = (int)_permissionRequest
                    },
                    hash = JsonSerializer.Serialize(gameState).HashGameState()
                });
            }

            return JsonSerializer.Serialize(new
            {
                _gameId = _id,
                _fieldDimensions,
                _playerNames = new
                {
                    white = _player1.Color == "white" ? _player1.Name : _player2?.Name,
                    black = _player1.Color == "white" ? _player2?.Name : _player1.Name,
                },
                _field,
                _history,
                _pieces,
                _currentPlayer,
                _gameOver,
                _draw,
                _permissionRequest = (int)_permissionRequest,
                _singlePlayer
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
        public bool GetOpponentCid(string playerId, out Client? opponent)
        {
            if(_player1.Id == playerId)
            {
                opponent = _player2;
            }
            else if(_player2?.Id == playerId)
            {
                opponent = _player1;
            }
            else
            {
                opponent = null;
                return false;
            }
            return true;
        }
        public bool RemoveClient(string clientId)
        {
            if(this._singlePlayer)
            {
                return true;
            }


            if(_player1.Id == clientId)
            {
                _player1.Disconnected = true;
            }
            else
            {
                if(_player2 != null)
                    _player2.Disconnected = true;
            }

            return (_player2?.Disconnected ?? true) && _player1.Disconnected;
        }
        public bool Reconnect(string clientId, WebSocket socket, out string color)
        {
            color = "";
            if (clientId != _player1.Id && clientId != _player2?.Id)
            {
               
                return false;
            }
            if(clientId == _player1.Id)
            {
                _player1.Socket = socket;
                _player1.Disconnected = false;
                color = _player1.Color;
            }
            else
            {
                if(_player2 != null)
                {
                    _player2.Socket = socket;
                    _player2.Disconnected = false;
                    color = _player2.Color;
                }
            }
            return true;
        }
        public bool ContainsPlayer(WebSocket socket, out string clientId)
        {
            if(_player1.Socket == socket)
            {
                //_player1.Disconnected = true;
                clientId = _player1.Id;
                return true;
            }
            if(_player2 != null && _player2.Socket == socket)
            {
                clientId = _player2.Id;
                _player2.Disconnected = true;
                return true;

            }
            clientId = "";
            return false;
        }
        public string GetGameId()
        {
            return this._id;
        }
        public bool IsLocalGame()
        {
            return this._singlePlayer;
        }
        public void SendExitRequest(string clientId)
        {
            Response response = new Response(ResponseTypes.ExitRequest);
            SendOpponentMessage(clientId, response);
            this.RemoveClient(clientId);
        }
        public void AddSocketToLoadedGame(WebSocket socket)
        {
            this._player1 = new Client("", socket, this._playerNamesTemp.white, "white");
            this._player2 = new Client("", socket, this._playerNamesTemp.black, "black");
        } 
        public void RenamePlayer(string identifier, string newName, bool idIsColor=false)
        {
            if((idIsColor ? _player1.Color : _player1.Id) == identifier)
            {
                _player1.Rename(newName);
            }
            else
            {
                _player2?.Rename(newName);
            }
        }
        public void SendOpponentMessage(string currentPlayerId, Response message)
        {
            if(_player1.Id == currentPlayerId)
            {
                _player2?.Socket?.sendMessage(message.ResponseMessage);
            }
            else
            {
                _player1.Socket?.sendMessage(message.ResponseMessage);
            }
        }
        public void SendOpponentMessage(string currentPlayerId, ResponseTypes response)
        {
            Response message = new Response(ResponseTypes.NoResponse);
            switch (response)
            {
                case ResponseTypes.Sync:
                    message = new Response(ResponseTypes.Sync,
                    new ResponseParam(ResponseKeys.GAME_STATE, this.GetGameState())
                    );
                    break;
                default:
                    break;
            }
            this.SendOpponentMessage(currentPlayerId, message);
        }
        public bool HasRequest()
        {
            return this._permissionRequest != PermissionRequest.Nothing;
        }
        public bool IsPlayersTurn(string clientId, int pieceId)
        {
            if(this.IsLocalGame())
            {
                Piece? piece = this.findPieceInGamefield(pieceId);
                return piece?.color == this._currentPlayer;
            }
            if(this._player1.Id == clientId)
            {
                return this._player1.Color == this._currentPlayer; 
            }
            else
            {
                return this._player2!.Color == this._currentPlayer;
            }
        }
        public bool KillstreakActive()
        {
            return this._onKillStreak;
        }
        public void ClearNextMoves()
        {
            this._nextMoves.Clear();
        }
    }
}
