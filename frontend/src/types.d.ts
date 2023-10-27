


type Color = {
    base: string,
    lighten5: string,
    lighten4: string,
    lighten3: string,
    lighten2: string,
    lighten1: string,
    darken1: string,
    darken2: string,
    darken3: string,
    darken4: string,
    accent1: string,
    accent2: string,
    accent3: string,
    accent4: string
}

type GameField = Array<Array<GameState>>

type GameState = {
    position: Position,
    containsPiece: boolean,
    piece: Piece|undefined
}
type PieceColors =  "white" | "black" | undefined

type Pieces = {
    white: Array<Piece>
    black: Array<Piece>
}

type History = {
    pieceId: number,
    start: Position,
    end: Position,
    killedPieceId: number | undefined

}

type Position = {
    x: number,
    y: number,
}

