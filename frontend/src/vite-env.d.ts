/// <reference types="vite/client" />
import {TinyEmitter} from "tiny-emitter";

export {}

declare module 'vue'{
    interface ComponentCustomProperties {
        $emitter: TinyEmitter
    }
}



