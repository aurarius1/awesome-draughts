/// <reference types="vite/client" />
import {RemovableRef} from "@vueuse/core";

type ColorState = {
    color: RemovableRef<Color>
}
type LanguageState = {
    language: RemovableRef<string>
}
type ThemeState = {
    theme: RemoveableRef<string>
}

type Color = {
    base: String,
    lighten5: String,
    lighten4: String,
    lighten3: String,
    lighten2: String,
    lighten1: String,
    darken1: String,
    darken2: String,
    darken3: String,
    darken4: String,
    accent1: String,
    accent2: String,
    accent3: String,
    accent4: String
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


declare module '*.vue'{

}




