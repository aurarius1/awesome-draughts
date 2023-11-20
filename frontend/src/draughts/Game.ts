import {PermissionRequest} from "@/globals.ts";

export {Game}
export type {Position, PieceColor, PlayerNames}

type Move = {
    pieceId: number,
    start: Position,
    end: Position,
    killedPieceId: number,
    pieceUpgraded: boolean
}
type Position = {
    x: number,
    y: number,
}
type PlayerNames = {
    [key: string]: string
}
type PieceColor = "black"|"white"
type ApiPiece = {
    id: number,
    isKing: boolean,
    isAlive: boolean,
    color: PieceColor,
    position: Position
}
type ApiField = {
    position: Position,
    containsPiece: boolean,
    pieceId: number,
    pieceColor: PieceColor
}
type ApiGameField = Array<Array<ApiField>>
type ApiPieces = {
    white: Array<ApiPiece>,
    black: Array<ApiPiece>
}
type ApiHistory = {
    moves: Array<Move>,
    revertedMoves: Array<Move>
}

export interface ApiGame {
    _gameId: string
    _field: ApiGameField
    _pieces: ApiPieces
    _history: ApiHistory
    _currentPlayer: PieceColor
    _fieldDimensions: number
    _playerNames: PlayerNames,
    _gameOver: boolean,
    _draw: boolean,
    _permissionRequest: PermissionRequest,
    _singlePlayer: boolean
}

class Game implements ApiGame
{
    public _gameId: string = ""
    public _field!: ApiGameField
    public _pieces!: ApiPieces
    public _history!: ApiHistory
    public _currentPlayer!: PieceColor
    public _fieldDimensions!: number
    public _gameOver: boolean = false
    public _draw: boolean = false
    public _playerNames: PlayerNames = {
        "white": "Alice",
        "black": "Bob"
    }

    public _singlePlayer: boolean = true
    public _ownColor: string  = ""
    public _cid: string= ""

    public _validMoves: Array<Position> = []
    public _isOnKillstreak: boolean = false
    public _selectedPiece: number = -1
    public _permissionRequest: PermissionRequest = PermissionRequest.Nothing

    constructor(
        {
            fieldDimensions = -1,
            playerName = "",
            ownColor = "",
            isLocalGame = true,
            gameState = undefined,
            gid = "",
            cid = ""

        } = {}
    ) {

        if(gameState !== undefined)
        {
            this.loadGameState(gameState);
            return;
        }

        if(fieldDimensions !== -1)
        {
            this._fieldDimensions = fieldDimensions;
        }
        else
        {
            this._fieldDimensions = 10
        }
        this._singlePlayer = isLocalGame;
        this._ownColor = ownColor;
        this._playerNames[ownColor] = playerName;
        this._gameId = gid
        this._cid = cid

        this._field = []
        this._pieces = {
            white: [],
            black: []
        }
        this._history = {
            moves: [],
            revertedMoves: [],
        }
        this._currentPlayer = "white"


    }

    public loadGameState(state: ApiGame)
    {
        if(state === undefined)
            return;

        this._field = state._field
        this._pieces = state._pieces
        this._currentPlayer = state._currentPlayer
        this._fieldDimensions = state._fieldDimensions
        this._playerNames = state._playerNames
        this._gameOver = state._gameOver
        this._draw = state._draw
        this._history = state._history
        this._permissionRequest = state._permissionRequest
        this._singlePlayer = state._singlePlayer
    }

    public setGameParameter(gid: string, cid: string)
    {
        this._cid = cid
        this._gameId = gid
    }

    public selectPiece(pieceId: number)
    {
        this._selectedPiece = pieceId;
    }

    public addValidMoves(validMoves: Array<Position>)
    {
        this._validMoves = validMoves;
    }

    private findPieceInGamefield(pieceId: number): ApiPiece|undefined
    {
        return this._pieces[this._currentPlayer][pieceId]
    }

    public getPositionOfPiece(pieceId: number)
    {
        return this.findPieceInGamefield(pieceId)?.position;
    }

    public setKillstreak(onKillstreak: boolean)
    {
        this._isOnKillstreak = onKillstreak;
    }

    public setPermissionRequest(request: PermissionRequest)
    {
        this._permissionRequest = request
    }

    public setOwnColor(color: string)
    {
        this._ownColor = color;
    }
}


