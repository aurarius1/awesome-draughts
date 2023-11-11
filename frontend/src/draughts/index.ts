import {Game, Piece, Position, PlayerNames} from './Game.ts'
import {isPlayableField, positionEqual} from "@draughts/Helper.ts";
import {socketState} from './socket'
export default Game
export {isPlayableField, positionEqual, Piece, socketState }
export type {Position, PlayerNames}