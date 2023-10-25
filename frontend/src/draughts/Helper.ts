export function isPlayableField(x, y){
    if(x % 2 === 0) {
        return y % 2 !== 0
    }
    else {
        return y % 2 === 0
    }
}