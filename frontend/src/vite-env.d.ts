/// <reference types="vite/client" />
type TestType = {
    start: string,
    end: string
}

type ColorState = {
    color: Object
}
type LanguageState = {
    language: RemovableRef<string>
}
type ThemeState = {
    theme: RemoveableRef<string>
}

declare module '*.vue'{

}




