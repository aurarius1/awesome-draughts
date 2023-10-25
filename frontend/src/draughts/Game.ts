import {isPlayableField} from "./Helper";
import {History, GameField, Pieces, PieceColors, Position, GameState} from "@/vite-env";

export class Piece{
    private readonly _id: number
    private readonly _color: PieceColors

    private _position: Position
    private _isKing: boolean
    private _isAlive: boolean

    constructor(color: PieceColors, id: number, position: Position)
    {
        this._id = id
        this._isKing = false
        this._color = color
        this._isAlive = true
        this._position = position
    }
    public get id()
    {
        return this._id
    }
    public get color()
    {
        return this._color
    }
    public get isKing()
    {
        return this._isKing
    }
    public set isKing(newVal)
    {
        this._isKing = newVal;
    }
    public get isAlive()
    {
        return this._isAlive;
    }
    public set isAlive(newVal)
    {
        this._isAlive = newVal;
    }
    public get position()
    {
        return this._position;
    }
    public set position(newPosition)
    {
        this._position = newPosition
    }
}

export class Game {
    private readonly _gameId: string
    private _field: GameField
    private _pieces: Pieces
    private _history: History
    private _currentPlayer: 'white' | 'black'

    constructor(fieldDimensions: number){

        this._gameId = Date.now().toString();
        this._field = []
        this._pieces = {
            white: [],
            black: []
        }
        this._currentPlayer = 'white'
        for(let y = 0; y < fieldDimensions; y++)
        {
            this._field.push([]);
            for(let x = 0; x < fieldDimensions; x++)
            {
                let containsPiece = false;
                let piece: Piece|undefined = undefined
                let position: Position = {x: x, y: y}
                let pieceColor: PieceColors = y < fieldDimensions / 2 ? "white" : "black"

                if(y != fieldDimensions/2 && y != fieldDimensions/2-1)
                {
                    containsPiece = isPlayableField(x, y);
                }
                if(containsPiece)
                {
                    piece = new Piece(pieceColor, (y*10)+x, position)
                    this._pieces[pieceColor].push(piece)
                }

                let state: GameState = {
                    position: position,
                    containsPiece: containsPiece,
                    piece: piece
                }
                this._field[y].push(state)
            }
        }
    }

    private findPieceInGamefield(pieceId: number): Piece
    {
        let whitePiece = this._pieces.white.find((piece) => {
            return piece.id === pieceId
        })
        if(whitePiece)
        {
            return whitePiece
        }
        return this._pieces.black.find((piece) => {
            return piece.id === pieceId
        })
    }
    public movePiece(pieceId: number, newPosition: Position)
    {
        let piece = this.findPieceInGamefield(pieceId);

        this._field[piece.position.y][piece.position.x].containsPiece = false;
        this._field[piece.position.y][piece.position.x].piece = undefined;

        this._field[newPosition.y][newPosition.x].containsPiece = true;
        this._field[newPosition.y][newPosition.x].piece = piece;

        piece.position = newPosition
    }
    public getFieldsToHighlight(pieceId: number)
    {
        let fieldsToHighlight: Array<Position> = [];
        let piece = this.findPieceInGamefield(pieceId)

        for(let y = -1; y < 2; y+=2)
        {
            for(let x = -1; x < 2; x+=2)
            {
                let posX = piece.position.x + x;
                let posY = piece.position.y + y;
                console.log(posX, posY);

                if(posX < 0 || posX > 9 || posY < 0 || posY > 9)
                    continue;

                if(this._field[posY][posX].containsPiece)
                    continue;

                fieldsToHighlight.push({x: posX, y: posY})
            }
        }


        return fieldsToHighlight
    }
    public getPositionOfPiece(pieceId: number)
    {
        return this.findPieceInGamefield(pieceId)?.position;
    }
    public get field(): GameField
    {
        return this._field
    }

    public get activePlayer()
    {
        return this._currentPlayer
    }
    public switchActivePlayer()
    {
        this._currentPlayer = this._currentPlayer === "white" ? "black" : "white"
    }

    public isGameOver()
    {
        let allWhiteDead = this._pieces.white.every((piece) => !piece.isAlive)
        if(allWhiteDead)
        {
            return "black"
        }


        let allBlackDead = this._pieces.black.every((piece) => !piece.isAlive)
        if(allBlackDead)
        {
            return "white"
        }
    }


}