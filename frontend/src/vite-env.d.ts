/// <reference types="vite/client" />
import {TinyEmitter} from "tiny-emitter";
import {  Router} from 'vue-router'


export {}


declare module 'vue'{
    interface ComponentCustomProperties {
        $emitter: TinyEmitter
    }
}

declare module 'pinia' {
    export interface PiniaCustomProperties {
        $router: Router;
        $emitter: TinyEmitter
    }
}


export type Anchor = "bottom" | "top" | "left" | "right"


