/// <reference types="vite/client" />
type TestType = {
    start: string,
    end: string
}

export type ColorState = {
    color: {
        base: object
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $emitter: any,
        $colorStore: any
    }
}



export {}