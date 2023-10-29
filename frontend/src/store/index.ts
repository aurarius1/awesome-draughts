import {defineStore} from "pinia"
import colors from 'vuetify/lib/util/colors'
import {RemovableRef, Serializer, useLocalStorage} from '@vueuse/core'
import {i18n} from "@/lang";

import Game from "@/draughts"
import fileDownload from 'js-file-download'
import {ca} from "vuetify/locale";
import {Exception} from "sass";

export const useColorStore = defineStore('colorStore',{
    state: () =>  {
        return {
            _currentColor: useLocalStorage("color", colors.blue),
        }
    },
    actions: {
        changeColor(newColor: Color){
            this._currentColor = newColor
        }
    },
    getters: {
        currentColor(state): Color{
            return state._currentColor
        }
    }
})

export const useLanguageStore = defineStore('languageStore',{
    state: () =>  {
        return {
            _currentLanguage: useLocalStorage("language", navigator.language),
        }
    },
    actions: {
        changeLanguage(newLanguage: string){
            i18n.global.availableLocales.forEach((locale) => {
                if(locale === newLanguage)
                {
                    this._currentLanguage = newLanguage
                    i18n.global.locale = locale
                }
            })
        }
    },
    getters: {
        currentLanguage: (state) => state._currentLanguage,
    }
})

export const useThemeStore = defineStore('themeStore',{
    state: () =>  {
        return {
            _currentTheme: useLocalStorage("theme", "dark"),
        }
    },
    actions: {
        changeTheme(newTheme: string){
            this._currentTheme = newTheme
        }
    },
    getters: {
        currentTheme: (state) => state._currentTheme,
    }
})


type test = {
    _currentGame: RemovableRef<Game>,
    _savedGames: RemovableRef<Array<number>>
}
function serializeGameState(value: Game): string
{
    return value.serialize()
}
function deserializeGameState(read: string): Game
{
    return new Game({
        serialized: read
    })
}

let serializer: Serializer<Game> = {
    write: serializeGameState,
    read: deserializeGameState
}
export const useGameStore = defineStore('gameStore',{
    state: (): test => {
        return {
            _currentGame: useLocalStorage("currentGame", new Game({fieldDimensions: -1}), { deep: true, listenToStorageChanges: true, serializer: serializer}),
            _savedGames: useLocalStorage("savedGames", [])
        }
    },
    actions: {
        startNewGame(dimensions: number){
            if(this._currentGame?.fieldDimensions === -1)
            {
                this._currentGame = new Game({fieldDimensions: dimensions})
            }

        },
        clear(){
            this._currentGame = new Game({fieldDimensions: -1})
        },
        endAndSave(remote: boolean){
            if(this._currentGame)
            {
                if(remote)
                {
                    this._savedGames.push(this._currentGame.gameId)
                }
                else
                {
                    fileDownload(serializeGameState(this._currentGame), `game-${this._currentGame.gameId}.aw`)
                }
                this._currentGame = new Game({fieldDimensions: -1})
            }
        },
        loadGame(gameState: string)
        {
            try{
                this._currentGame = deserializeGameState(gameState)
                return this._currentGame.fieldDimensions !== -1;
            }
            catch(error: any){
                console.log(error)
                return false
            }
        }

    },
    getters: {
        currentGame: (state): Game => {
            return state._currentGame
        }
    }
})