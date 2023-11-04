/// <reference types="vite/client" />
import {TinyEmitter} from "tiny-emitter";

export {}

declare module 'vue'{
    interface ComponentCustomProperties {
        $emitter: TinyEmitter
    }
}

export type Anchor = "bottom" | "top" | "left" | "right"


