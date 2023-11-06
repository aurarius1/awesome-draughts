export enum LeaveTypes {
    saveLocal   = 1,
    saveRemote  = 2,
    exit        = 3,

    noLeave     = -1
}
export function heightBreakpoints(){
    let currentHeight = document.documentElement.clientHeight;
    if(currentHeight >= 2160)
        return 0.9;
    if(currentHeight >= 1080)
        return 0.8;
    if(currentHeight >= 720)
        return 0.7;
    return 0.5;
}



