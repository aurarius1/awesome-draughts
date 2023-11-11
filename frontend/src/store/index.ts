import {defineStore} from "pinia"
import colors from 'vuetify/lib/util/colors'
import {RemovableRef, Serializer, useLocalStorage, useWebSocket} from '@vueuse/core'
import {i18n} from "@/lang";

import Game, {PlayerNames} from "@/draughts"
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
    _savedGames: RemovableRef<Array<number>>,
    ws: any
}
function serializeGameState(value: Game): string
{
    return value.serialize()
}
function deserializeGameState(read: string, refresh=true): Game
{
    return new Game({
        serialized: read,
        refresh: refresh
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
            _savedGames: useLocalStorage("savedGames", []),
            ws: undefined
        }
    },
    actions: {
        startNewGame(dimensions: number, playerNames: PlayerNames = {"white": "Alice", "black": "Bob"}){
            console.log("fotze", this._currentGame?.fieldDimensions)
            console.log("LECK MICH FETT");
            this._currentGame = new Game({fieldDimensions: dimensions})
            this._currentGame.updatePlayerName("white", playerNames.white);
            this._currentGame.updatePlayerName("black", playerNames.black);

        },
        startNewRemoteGame(dimensions: number, player: "white"|"black", name: string){
            this._currentGame = new Game({fieldDimensions: dimensions})
            this._currentGame.setRemote(player, name)
            this._currentGame.updatePlayerName(player, name)
            this.startWebSocket("init;"+name+";"+player)
        },
        joinRemoteGame(dimensions: number, player: "white"|"black", name: string, gid: string, cid: string){
            this._currentGame = new Game({fieldDimensions: dimensions})
            this._currentGame.setRemote(player, name)
            this._currentGame.updatePlayerName(player, name)
            this._currentGame.setGameParameter(gid, cid);
        },
        joinGame(gid: string, name: string){
            this.startWebSocket("join;"+gid+";" + name)
        },
        startWebSocket(command: string){
            // TODO THIS SHOULD NOT BE HARDCODED
            const url = "wss://localhost:32770/ws";
            this.ws = new WebSocket(url)
            this.ws.onopen = () => {
                this.ws?.send(command);
            }
            this.ws.onmessage = this.parseSocketMessage
        },
        parseSocketMessage(msg: any)
        {
            let state = JSON.parse(msg.data);
            switch(state.state)
            {
                case "INIT":
                    this._currentGame.setGameParameter(state.gid, state.cid);
                    break;
                case "JOIN":
                    this.joinRemoteGame(10, state.color, state.name, state.gid, state.cid)
                    break
                case "GAME STARTED":
                    let otherColor = this._currentGame.ownColor === "white" ? "black" : "white";
                    this._currentGame.updatePlayerName(otherColor, state.gameState.playerNames[otherColor]);
                    this.$router.replace("/game");
                    break;
            }
        },
        closeWS()
        {
            switch(this.ws.readyState)
            {
                case WebSocket.OPEN:
                    this.ws.close();
                    break;
                case WebSocket.CLOSED:
                case WebSocket.CLOSING:
                    console.log("WEBSOCKET ALREADY CLOSED");

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
                this._currentGame = deserializeGameState(gameState, false)
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