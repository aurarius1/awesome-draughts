import {isPlayableField} from "./Helper"

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
    lastMove: number,
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

class Piece  {
    readonly _id: number
    readonly _color: PieceColors

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
    public get position()
    {
        return this._position;
    }
    public set position(newPosition)
    {
        this._position = newPosition
    }



}

class Game {
    private readonly _gameId: number
    private _field: GameField
    private _pieces: Pieces
    private _history: History
    private _currentPlayer: 'white' | 'black'
    private readonly _fieldDimensions: number

    constructor({fieldDimensions = -1, serialized = ""} = {}){
        if(fieldDimensions !== -1)
        {
            this._history = {
                moves: [],
                lastMove: -1
            }
            this._gameId = Date.now()
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
            console.log(pieces)
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
            console.log(deserializedGame._history)
            this._history = deserializedGame._history
            this._currentPlayer = deserializedGame._currentPlayer
        }
        else
        {
            this._gameId = -1
            this._fieldDimensions = -1
            this._field = []
            this._pieces = {
                white: [],
                black: []
            }
            this._currentPlayer = "white"
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
    public movePiece(pieceId: number, newPosition: Position)
    {
        let piece = this.findPieceInGamefield(pieceId);



        if(piece === undefined)
            return;




        this._field[piece.position.y][piece.position.x].containsPiece = false;
        this._field[piece.position.y][piece.position.x].piece = undefined;

        this._field[newPosition.y][newPosition.x].containsPiece = true;
        this._field[newPosition.y][newPosition.x].piece = piece;

        let killedPiece = -1

        if(piece.isKing){
            //TODO
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

        }

        this._history.moves = []

        let move: Move = {
            pieceId: pieceId,
            start: piece.position,
            end: newPosition,
            killedPieceId: killedPiece,
            pieceUpgraded: false, // TODO
        }

        // TODO reset everything after current node if redo

        this._history.moves.push(move)
        this._history.lastMove = this._history.lastMove+1
        console.log("HALLLO" , this._history.lastMove)
        piece.position = newPosition
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
        let fieldsToHighlight: Array<Position> = [];
        let piece = this.findPieceInGamefield(pieceId)

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

                fieldsToHighlight.push({x: posX, y: posY})
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
            return "black"
        }


        let allBlackDead = Object.values(this._pieces.black).every((piece) => !piece.isAlive)
        if(allBlackDead)
        {
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
        // TODO FIX ME
        let lastMove = this._history.moves[this._history.lastMove];
        if(lastMove === undefined){
            return
        }

        let piece = this.findPieceInGamefield(lastMove.pieceId)
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
        }
        this._history.lastMove = this._history.lastMove - 1;
        this.switchActivePlayer()
    }
    public serialize()
    {
        let gameObj = {
            _gameId: this._gameId,
            _pieces: this._pieces,
            _history: this._history,
            _currentPlayer: this._currentPlayer,
            _fieldDimensions: this._fieldDimensions
        }





        return JSON.stringify(
            gameObj
        )
    }

}

