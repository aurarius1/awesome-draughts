import {defineStore} from "pinia"
import colors from 'vuetify/lib/util/colors'
import {RemovableRef, Serializer, useLocalStorage, useWebSocket} from '@vueuse/core'
import {i18n} from "@/lang";

import Game, {PlayerNames} from "@/draughts"
import fileDownload from 'js-file-download'

import {ca} from "vuetify/locale";
import {Exception} from "sass";
import {ApiGame, ServerGame} from "@draughts/Game.ts";
import {Position} from "@/draughts";
import {LeaveTypes} from "@/globals.ts";

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
    _clientId: RemovableRef<String>,
    _currentGameId: RemovableRef<String>,
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
            _clientId: useLocalStorage("clientId", ""),
            _currentGameId: useLocalStorage("gameId", ""),
            ws: undefined
        }
    },
    actions: {
        startNewGame(dimensions: number, playerNames: PlayerNames = {"white": "Alice", "black": "Bob"}){
            console.log("HALLO MAMA");
            this.startWebSocket(`local;${playerNames.white};${playerNames.black}`)

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
        loadGame(gid: string)
        {
            this._currentGameId = gid;
            this.startWebSocket(`load;${gid}`)
            console.log("HALLLLO MARTIN", this._currentGameId);
        },
        startWebSocket(command: string){

            if(command !== "" && !command.startsWith("load"))
            {
                this._clientId = ""
                this._currentGameId = ""
            }

            // TODO THIS SHOULD NOT BE HARDCODED
            const url = "wss://localhost:32768/ws";
            this.ws = new WebSocket(url)
            this.ws.onopen = () => {
                if(this._currentGameId !== "" && command === "")
                {
                    this.ws?.send(`reconnect;${this._currentGameId};${this._clientId}`)
                }
                else
                {
                    console.log("TJAJAJ", command);
                    this.ws?.send(command);
                }

            }
            this.ws.onmessage = this.parseSocketMessage
        },
        parseSocketMessage(msg: any)
        {
            let state = JSON.parse(msg.data);
            const toast = useToast();
            // TODO HANDLE ERROR STATES
            switch(state.state)
            {
                case "INIT_OK":
                    if(this._currentApiGame === undefined)
                    {
                        // TODO ERROR NOTIFICATIONS
                        return;
                    }
                    this._currentApiGame.setGameParameter(state.gid, state.cid);
                    this._clientId = state.cid;
                    this._currentGameId = state.gid;
                    break;
                case "JOIN_OK":
                    this.joinRemoteGame(10, state.color, state.name, state.gid, state.cid)
                    this._clientId = state.cid;
                    this._currentGameId = state.gid;
                    break
                case "GAME_STARTED":
                    if(this._currentApiGame === undefined)
                    {
                        // TODO ERROR NOTIFICATIONS
                        return;
                    }
                    this._currentApiGame.loadGameState(state.gameState);
                    this.$router.replace("/game");
                    break;
                case "MOVES_OK":
                    this._currentApiGame?.addValidMoves(state.moves);
                    //this.$emitter.emit("highlight-field", state.moves);
                    break;
                case "MOVE_OK":
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentApiGame?.addValidMoves(state.moves);
                    this._currentApiGame?.setKillstreak(true);
                    break;
                case "LOAD_OK":
                    console.log("HALLO");
                    
                    this.$router.replace("/game");
                case "SYNC":
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentApiGame?.addValidMoves([]);
                    this._currentApiGame?.setKillstreak(false);
                    this._currentApiGame?.selectPiece(-1);
                    break;
                case "INVALID_MOVE":
                    switch(state.errorMessage ?? "")
                    {
                        case "invalid_move":
                            toast.warning(i18n.global.t('toasts.warning.invalid_move'))
                            break
                        case "on_kill_streak":
                            toast.error(i18n.global.t("toasts.error.on_kill_streak"))
                            break
                        default:
                            toast.warning(i18n.global.t('toasts.warning.invalid_move'))
                            console.log("INVALID MOVE; ERROR UNKNOWN");
                    }
                    break
                case "PERMISSION_REQUEST":
                    this._currentApiGame?.setPermissionRequest(state.request)
                    break;
                case "PERMISSION_REQUEST_ANSWERED":
                    toast.info(state.requestAnswer)
                    break
                case "RECONNECT_OK":
                    if(this._currentApiGame === undefined)
                    {
                        this._currentApiGame = new ServerGame()
                    }
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentApiGame?.setOwnColor(state.color);
                    break;
                case "LOCAL_OK":
                    console.log(state.gameState);
                    this._currentApiGame = new ServerGame({
                        fieldDimensions: state.gameState._fieldDimensions,
                        isLocalGame: true,
                        gid: state.gameState._gameId,
                    })
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentGameId = state.gameState._gameId;
                    break;
                case "DLC":
                    toast.info(i18n.global.t('dlc'))
                    break;
                case "EXIT_REQUEST":
                    this.$emitter.emit('opponentExited');
                    break;
                case "SAVE_DATA":
                    fileDownload(JSON.stringify(state.gameState), `game-${this._currentGameId}.aw`)
                case "EXIT_OK":
                    this.closeWS();
                    this.$router.replace("/");

            }
        },
        getValidMoves(pieceId: number, pieceColor: string)
        {
            const toast = useToast();
            if(
                (this._currentApiGame?._currentPlayer === this._currentApiGame?._ownColor) ||
                (this._currentApiGame?._isLocalGame && this._currentApiGame?._currentPlayer == pieceColor)
            )
            {
                if(!this._currentApiGame?.isOnKillstreak)
                {
                    this._currentApiGame?.selectPiece(pieceId);
                    this.ws?.send(`moves;${this._currentGameId};${pieceId}`)
                    return true;
                }
                return false;
            }
            else
            {
                if(this._currentApiGame?._isLocalGame)
                {
                    if(this._currentApiGame?._validMoves.length === 0)
                    {
                        toast.warning(i18n.global.t("toasts.warning.not_your_turn"))
                    }
                }
                else{
                    toast.warning(i18n.global.t("toasts.warning.not_your_turn"))
                }
                return false;
            }
        },
        move(pieceId: number, destination: Position)
        {
            this.ws?.send(`move;${this._currentGameId};${this._clientId};${pieceId};${destination.x};${destination.y}`)
        },
        requestUndo()
        {
            this.ws?.send(`undo;${this._currentGameId};${this._clientId}`)
        },
        requestRedo()
        {
            this.ws?.send(`redo;${this._currentGameId};${this._clientId}`)
        },
        requestDraw()
        {
            this.ws?.send(`draw;${this._currentGameId};${this._clientId}`)
        },
        answer(accept: boolean = true)
        {
            this.ws?.send(`answer;${this._currentGameId};${this._clientId};${accept}`)
        },
        exit(leaveType: LeaveTypes)
        {
          this.ws?.send(`exit;${this._currentGameId};${this._clientId};${leaveType}`)
        },
        closeWS()
        {
            switch(this.ws?.readyState)
            {
                case WebSocket.OPEN:
                    this.ws?.close(1000, `${this._currentGameId};${this._clientId}`);
                    this._currentGameId = "";
                    this._clientId = "";
                    break;
                case WebSocket.CLOSED:
                case WebSocket.CLOSING:
                    console.log("WEBSOCKET ALREADY CLOSED");
                default:
                    console.log("LECK MICH");

            }

        },
        clear(){
            this._currentGame = new Game({fieldDimensions: -1})
        },

    },
    getters: {
        currentGame: (state) => {
            return state._currentApiGame
        },
    }
})