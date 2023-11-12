import {defineStore} from "pinia"
import colors from 'vuetify/lib/util/colors'
import {RemovableRef, Serializer, useLocalStorage, useWebSocket} from '@vueuse/core'
import {i18n} from "@/lang";

import Game, {PlayerNames} from "@/draughts"
import fileDownload from 'js-file-download'

import {ca} from "vuetify/locale";
import {Exception} from "sass";
import {ApiGame, ServerGame} from "@draughts/Game.ts";

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
    _currentApiGame: ServerGame | undefined,
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
            _currentApiGame: undefined,
            ws: undefined
        }
    },
    actions: {
        startNewGame(dimensions: number, playerNames: PlayerNames = {"white": "Alice", "black": "Bob"}){
            this._currentGame = new Game({fieldDimensions: dimensions})
            this._currentGame.updatePlayerName("white", playerNames.white);
            this._currentGame.updatePlayerName("black", playerNames.black);

        },
        startNewRemoteGame(dimensions: number, color: "white"|"black", name: string){
            this._currentApiGame = new ServerGame({
                fieldDimensions: dimensions,
                playerName: name,
                ownColor: color
            })
            this.startWebSocket("init;"+name+";"+color)
        },
        joinRemoteGame(dimensions: number, color: "white"|"black", name: string, gid: string, cid: string){
            this._currentApiGame = new ServerGame({
                fieldDimensions: dimensions,
                playerName: name,
                ownColor: color,
                gid: gid,
                cid: cid,
            })
        },
        joinGame(gid: string, name: string){
            this.startWebSocket("join;"+gid+";" + name)
        },
        startWebSocket(command: string){
            // TODO THIS SHOULD NOT BE HARDCODED
            const url = "wss://localhost:32768/ws";
            this.ws = new WebSocket(url)
            this.ws.onopen = () => {
                this.ws?.send(command);
            }
            this.ws.onmessage = this.parseSocketMessage
        },
        parseSocketMessage(msg: any)
        {
            console.log(msg);
            let state = JSON.parse(msg.data);

            switch(state.state)
            {
                case "INIT":
                    if(this._currentApiGame === undefined)
                    {
                        // TODO ERROR NOTIFICATIONS
                        return;
                    }
                    this._currentApiGame.setGameParameter(state.gid, state.cid);
                    break;
                case "JOIN":
                    this.joinRemoteGame(10, state.color, state.name, state.gid, state.cid)
                    break
                case "GAME STARTED":
                    if(this._currentApiGame === undefined)
                    {
                        // TODO ERROR NOTIFICATIONS
                        return;
                    }
                    this._currentApiGame.loadGameState(state.gameState);
                    this.$router.replace("/game");
                    break;
                case "MOVES":
                    console.log("HALLO FROM MOVES", state);
                    this._currentApiGame?.addValidMoves(state.moves);
                    this.$emitter.emit("highlight-field", state.moves);
                    break;

            }
        },
        getValidMoves(pieceId: number)
        {
            this.ws?.send(`moves;${this._currentApiGame?._gameId};${pieceId}`)
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
        currentGame: (state) => {
            return state._currentApiGame
        },
    }
})