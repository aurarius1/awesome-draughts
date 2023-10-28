import {Position} from "./Game";

export function isPlayableField(x: number, y: number){
    if(x % 2 === 0) {
        return y % 2 !== 0
    }
    else {
        return y % 2 === 0
    }
}

export function positionEqual(firstPosition: Position, secondPosition: Position)
{
    return firstPosition?.x === secondPosition?.x && firstPosition?.y === secondPosition?.y
}