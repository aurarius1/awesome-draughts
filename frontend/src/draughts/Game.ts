import {isPlayableField} from "./Helper"
import {useWebSocket} from "@vueuse/core";
import {socketState} from "@draughts/socket.ts";
import {de} from "vuetify/locale";

export {Piece, Game}
export type {Position, History, PieceColors, GameState, GameField}


type GameField = Array<Array<GameState>>

type GameState = {
    position: Position,
    containsPiece: boolean,
    piece: Piece|undefined
}
type PieceColors =  "white" | "black" | undefined

type Pieces = {
    [key: string]: {
        [key: number]: Piece
    }
}

type History = {
    moves: Array<Move>,
    revertedMoves: Array<Move>
}

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

type SerializedPiece = {
    _id: number,
    _color: PieceColors,
    _position: Position,
    _isKing: boolean,
    _isAlive: boolean,
}

export type PlayerNames = {
    [key: string]: string
}

class Piece  {
    _id: number
    _color: PieceColors

    _position: Position
    _isKing: boolean
    _isAlive: boolean

    constructor(color: PieceColors, id: number, position: Position, {isKing=false, isAlive=true} = {})
    {
        this._id = id
        this._isKing = isKing
        this._color = color
        this._isAlive = isAlive
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
    public die()
    {
        this._isAlive = false;
    }
    public undie()
    {
        this._isAlive = true
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

type ApiPiece = {
    id: number,
    isKing: boolean,
    isAlive: boolean,
    color: 'white'|'black',
    position: Position
}

type ApiField = {
    position: Position,
    containsPiece: boolean,
    piece: ApiPiece|null
}

type ApiGameField = Array<Array<ApiField>>

type ApiPieces = {
    white: Array<ApiPiece>
    black: Array<ApiPiece>
}

export interface ApiGame {
    _gameId: string
    _field: ApiGameField
    _pieces: ApiPieces
    _history: string
    _currentPlayer: 'white' | 'black'
    _fieldDimensions: number
    _playerNames: PlayerNames
}

export class ServerGame implements ApiGame
{
    public _gameId: string = ""
    public _field: ApiGameField
    public _pieces: ApiPieces
    public _history: History
    public _currentPlayer: 'white' | 'black'
    public _fieldDimensions: number
    public _gameOver: boolean = false
    public _playerNames: PlayerNames = {
        "white": "Alice",
        "black": "Bob"
    }

    public _isLocalGame: boolean = true
    public _ownColor: string  = ""
    public _cid: string= ""


    public _validMoves: Array<Position> = []

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
        this._isLocalGame = isLocalGame;
        this._ownColor = ownColor;
        this._playerNames[ownColor] = playerName;
        this._gameId = gid
        this._cid = cid
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
    }

    public setGameParameter(gid: string, cid: string)
    {
        this._cid = cid
        this._gameId = gid
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
}

class Game {
    private _gameId: string = ""
    private _field: GameField
    private _pieces: Pieces
    private _history: History
    private _currentPlayer: 'white' | 'black'
    private _fieldDimensions: number
    private _gameOver: boolean = false
    private _playerNames: PlayerNames = {
        "white": "Alice",
        "black": "Bob"
    }

    private _isLocalGame: boolean = true
    private _ownColor: string  = ""
    private _cid: string= ""

    constructor({fieldDimensions = -1, serialized = "", refresh=true} = {}){
        if(fieldDimensions !== -1)
        {
            this._history = {
                moves: [],
                revertedMoves: [],
            }
            this._field = []
            this._pieces = {
                white: {},
                black: {}
            }
            this._fieldDimensions = fieldDimensions
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
                        this._pieces[pieceColor][piece.id] = piece
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
        else if(serialized !== "")
        {
            // TODO VALIDATE ALL MVOES ETC


            let deserializedGame = JSON.parse(serialized)
            this._gameId = deserializedGame._gameId
            this._fieldDimensions = deserializedGame._fieldDimensions
            this._field = this.initalizeFieldWithoutPieces()

            let pieces = deserializedGame._pieces
            this._pieces = {
                white: {},
                black: {}
            }
            Object.keys(this._pieces).forEach((key) => {
                Object.keys(pieces[key]).forEach((id) => {

                    let piece: SerializedPiece = pieces[key][id]


                    let deserializedPiece =
                        new Piece(piece._color, piece._id, piece._position, {
                            isAlive: piece._isAlive,
                            isKing: piece._isKing
                        })
                    this._pieces[key][deserializedPiece.id] = deserializedPiece

                    if(deserializedPiece.isAlive)
                    {
                        this._field[deserializedPiece.position.y][deserializedPiece.position.x].piece = deserializedPiece
                        this._field[deserializedPiece.position.y][deserializedPiece.position.x].containsPiece = true

                    }
                })
            })
            this._history = deserializedGame._history
            this._currentPlayer = deserializedGame._currentPlayer
            this._playerNames = deserializedGame._playerNames ?? {
                "black": "Bob",
                "white": "Alice"
            }

            this._cid = deserializedGame._cid
            this._ownColor = deserializedGame._ownColor
            this._isLocalGame = deserializedGame._isLocalGame
        }
        else
        {
            this._fieldDimensions = -1
            this._field = []
            this._pieces = {
                white: [],
                black: []
            }
            this._currentPlayer = "white"
            this._history = {
                moves: [],
                revertedMoves: [],
            }
        }


    }



    private initalizeFieldWithoutPieces()
    {
        let field: GameField = []
        for(let y = 0; y < this._fieldDimensions; y++)
        {
            field.push([]);
            for(let x = 0; x < this._fieldDimensions; x++)
            {
                field[y].push({
                    position: {x: x, y: y},
                    containsPiece: false,
                    piece: undefined
                })
            }
        }
        return field
    }
    private findPieceInGamefield(pieceId: number): Piece|undefined
    {
        let whitePiece = this._pieces.white[pieceId]
        if(whitePiece !== undefined)
        {
            return whitePiece
        }
        return this._pieces.black[pieceId]
    }
    private isKillStreakPossible(piece: Piece){
        return this._getFieldsToHighlight(piece, true)
    }
    public movePiece(pieceId: number, newPosition: Position)
    {
        let piece = this.findPieceInGamefield(pieceId);

        if(piece === undefined)
            return [];

        this._field[piece.position.y][piece.position.x].containsPiece = false;
        this._field[piece.position.y][piece.position.x].piece = undefined;

        this._field[newPosition.y][newPosition.x].containsPiece = true;
        this._field[newPosition.y][newPosition.x].piece = piece;

        let killedPiece = -1
        let pieceUpgraded = false
        if(piece._isKing){
            let xDiff = newPosition.x - piece.position.x;
            let yDiff = newPosition.y - piece.position.y;

            let xOffset = xDiff/Math.abs(xDiff);
            let yOffset = yDiff/Math.abs(yDiff);

            for(let multiplier = 1; multiplier < Math.abs(xDiff); multiplier++){
                let deletingX = piece.position.x + (xOffset*multiplier);
                let deletingY = piece.position.y + (yOffset*multiplier);
                if(this._field[deletingY][deletingX].containsPiece){
                    killedPiece = this._field[deletingY][deletingX].piece?.id ?? -1
                    this._field[deletingY][deletingX].containsPiece = false;
                    this._field[deletingY][deletingX].piece?.die()
                    this._field[deletingY][deletingX].piece = undefined;
                    break;
                }
            }
        }else{
            let xDiff = newPosition.x - piece.position.x;
            if(Math.abs(xDiff) !== 1){
                let yDiff = newPosition.y - piece.position.y;
                let deletingX = piece.position.x + (xDiff/2);
                let deletingY = piece.position.y + (yDiff/2);

                killedPiece = this._field[deletingY][deletingX].piece?.id ?? -1

                this._field[deletingY][deletingX].containsPiece = false;
                this._field[deletingY][deletingX].piece?.die()
                this._field[deletingY][deletingX].piece = undefined;

            }

            if(piece.color === "white" && newPosition.y === this._fieldDimensions-1)
            {
                pieceUpgraded = true
            }
            else if(piece.color === "black" && newPosition.y === 0)
            {
                pieceUpgraded = true
            }


            piece._isKing = pieceUpgraded
        }

        let move: Move = {
            pieceId: pieceId,
            start: piece.position,
            end: newPosition,
            killedPieceId: killedPiece,
            pieceUpgraded: pieceUpgraded, // TODO
        }
        this._history.moves.push(move)
        this._history.revertedMoves = []
        piece.position = newPosition

        if(killedPiece !== -1)
        {
            return this.isKillStreakPossible(piece)
        }


        return []
    }

    private evaluatePosition(pos: Position|undefined, offset: number, operation: string){
        if(pos === undefined)
            return {x: -1, y: -1};

        switch (operation){
            case '--':
                //TopLeft
                return {x: pos.x-offset, y:pos.y-offset};
            case '+-':
                //TopRight
                return {x: pos.x+offset, y:pos.y-offset};

            case '-+':
                //BottomLeft
                return {x: pos.x-offset, y:pos.y+offset};

            case '++':
                //BottomRight
                return {x: pos.x+offset, y:pos.y+offset};

            default:
                return {x: -1, y: -1};
        }
    }

    public getFieldsToHighlight(pieceId: number)
    {
        let piece: Piece|undefined = this.findPieceInGamefield(pieceId);
        if(piece === undefined)
        {
            return []
        }
        return this._getFieldsToHighlight(piece)
    }

    private _getFieldsToHighlight(piece: Piece, checkForAdditionalKill: boolean = false)
    {
        let fieldsToHighlight: Array<Position> = [];

        const operations = ['--', '+-', '-+', '++'];//TopLeft, TopRight, BottomLeft, BottomRight

        operations.forEach((ops, index) => {
            let hitPiece = false;
            let maxDistance = piece?.isKing ? 10 : 3;

            for(let offset = 1; offset < maxDistance; offset+=1){
                if(offset > 1 && !piece?.isKing && !hitPiece){
                    break;
                }

                let pos = this.evaluatePosition(piece?.position, offset, ops);
                let posX = pos.x;
                let posY = pos.y;

                if(posX < 0 || posX > 9 || posY < 0 || posY > 9)
                    break;

                if(this._field[posY][posX].containsPiece){
                    let notOpposing = this._field[posY][posX].piece?.color === piece?.color;
                    if(hitPiece || notOpposing){
                        break;
                    }
                    hitPiece = true;
                    continue;
                }

                if(offset == 1 && !piece?.isKing){
                    if(piece?.color === "white" && (index == 0 || index == 1))
                        break;
                    if(piece?.color === "black" && (index == 2 || index == 3))
                        break;
                }
                if(checkForAdditionalKill)
                {
                    if(hitPiece)
                    {
                        fieldsToHighlight.push({x: posX, y: posY})
                    }

                } else
                {
                    fieldsToHighlight.push({x: posX, y: posY})
                }

            }
        })


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
        let allWhiteDead =  Object.values(this._pieces.white).every((piece) => !piece.isAlive)
        if(allWhiteDead)
        {
            this._gameOver = true;
            return "black"
        }


        let allBlackDead = Object.values(this._pieces.black).every((piece) => !piece.isAlive)
        if(allBlackDead)
        {
            this._gameOver = true;
            return "white"
        }
    }
    public get gameId()
    {
        return this._gameId
    }
    public get fieldDimensions()
    {
        return this._fieldDimensions
    }
    public undoMove()
    {

        let lastMove: Move|undefined = undefined
        let piece: Piece|undefined = undefined;
        do{
            lastMove = this._history.moves.pop()
            if(lastMove === undefined){
                return
            }
            piece = this.findPieceInGamefield(lastMove.pieceId)
            if(piece === undefined) {
                return
            }
            this._field[piece.position.y][piece.position.x].containsPiece = false
            this._field[piece.position.y][piece.position.x].piece = undefined
            piece.position = lastMove.start
            this._field[lastMove.start.y][lastMove.start.x].containsPiece = true
            this._field[lastMove.start.y][lastMove.start.x].piece = piece


            let killedPiece = this.findPieceInGamefield(lastMove.killedPieceId)
            if(killedPiece !== undefined)
            {
                this._field[killedPiece.position.y][killedPiece.position.x].containsPiece = true
                this._field[killedPiece.position.y][killedPiece.position.x].piece = killedPiece
                killedPiece.undie()
            }
            if(lastMove.pieceUpgraded)
            {
                piece._isKing = false
            }
            this._history.revertedMoves.push(lastMove)
        }while(piece?.id === this._history.moves[this._history.moves.length-1]?.pieceId)

        this.switchActivePlayer()
        return this._history.moves.length === 0
    }
    public redoMove()
    {
        let nextMove: Move|undefined = undefined
        let piece: Piece|undefined = undefined;
        do{
            nextMove = this._history.revertedMoves.pop()
            if(nextMove === undefined){
                return
            }
            piece = this.findPieceInGamefield(nextMove.pieceId)
            if(piece === undefined) {
                return
            }
            this._field[piece.position.y][piece.position.x].containsPiece = false
            this._field[piece.position.y][piece.position.x].piece = undefined
            piece.position = nextMove.end
            this._field[nextMove.end.y][nextMove.end.x].containsPiece = true
            this._field[nextMove.end.y][nextMove.end.x].piece = piece

            let killedPiece = this.findPieceInGamefield(nextMove.killedPieceId)
            if(killedPiece !== undefined)
            {
                this._field[killedPiece.position.y][killedPiece.position.x].containsPiece = false
                this._field[killedPiece.position.y][killedPiece.position.x].piece = undefined
                killedPiece.die()
            }
            if(nextMove.pieceUpgraded)
            {
                piece._isKing = true
            }
            this._history.moves.push(nextMove)
        }while(piece?.id === this._history.revertedMoves[this._history.revertedMoves.length-1]?.pieceId)
        this.switchActivePlayer()
        return this._history.revertedMoves.length === 0
    }
    public undoPossible()
    {
        return this._history.moves.length !== 0
    }
    public redoPossible()
    {
        return this._history.revertedMoves.length !== 0
    }
    public get gameOver()
    {
        return this._gameOver
    }
    public get playerNames()
    {
        return this._playerNames
    }
    public updatePlayerName(player: string, name: string)
    {
        console.log("UPDATE NAME: ", player, name);
        this._playerNames[player] = name
    }
    public getPlayerName(player: string)
    {
        return this._playerNames[player];
    }
    public getCurrentPlayerName()
    {
        return this._playerNames[this._currentPlayer];
    }

    public changePlayerName(player: string, name: string)
    {
        this._playerNames[player] = name;
    }

    public setRemote(ownColor: "black"|"white", name: string)
    {
        this._ownColor = ownColor
        this._isLocalGame = false;
    }

    public setGameParameter(gid: string, cid: string)
    {
        this._gameId = gid;
        this._cid = cid;
    }

    public draw(){
        this._gameOver = true
    }


    public get ownColor()
    {
        return this._ownColor
    }
    public serialize()
    {
        let gameObj = {
            _gameId: this._gameId,
            _pieces: this._pieces,
            _history: this._history,
            _ownColor: this._ownColor,
            _cid: this._cid,
            _isLocalGame: this._isLocalGame,
            _currentPlayer: this._currentPlayer,
            _fieldDimensions: this._fieldDimensions,
            _gameOver: this._gameOver,
            _playerNames: this._playerNames
        }

        return JSON.stringify(
            gameObj
        )
    }

}

