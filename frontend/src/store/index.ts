import {defineStore} from "pinia"
import colors, {VuetifyColor} from '@/VuetifyColors'
import {RemovableRef, useLocalStorage} from '@vueuse/core'
import {i18n} from "@/lang";

import {PlayerNames, Position} from "@/draughts"
import fileDownload from 'js-file-download'

import Game from "@/draughts"
import {LeaveTypes, PermissionRequest} from "@/globals.ts";

type ResponseJson = {
    [key: string]: any,
}



export const useColorStore = defineStore('colorStore',{
    state: () =>  {
        return {
            _currentColor: useLocalStorage("color", colors.blue),
        }
    },
    actions: {
        changeColor(newColor: VuetifyColor){
            this._currentColor = newColor
        }
    },
    getters: {
        currentColor(state): VuetifyColor{
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


type GameStore = {
    _currentApiGame: Game | undefined,
    _clientId: RemovableRef<String>,
    _currentGameId: RemovableRef<String>,
    _requestSent: RemovableRef<boolean>,
    ws: any
}


export const useGameStore = defineStore('gameStore',{
    state: (): GameStore => {
        return {
            _currentApiGame: undefined,
            _clientId: useLocalStorage("clientId", ""),
            _currentGameId: useLocalStorage("gameId", ""),
            _requestSent: useLocalStorage("request", false),
            ws: undefined
        }
    },
    actions: {
        startNewGame(playerNames: PlayerNames = {"white": "Alice", "black": "Bob"}){
            this.startWebSocket(`local;${playerNames.white};${playerNames.black}`)
        },
        startNewRemoteGame(dimensions: number, color: "white"|"black", name: string){
            this._currentApiGame = new Game({
                fieldDimensions: dimensions,
                playerName: name,
                ownColor: color,
                isLocalGame: false,
            })
            this.startWebSocket("init;"+name+";"+color)
        },
        joinRemoteGame(dimensions: number, color: "white"|"black", name: string, gid: string, cid: string){
            this._currentApiGame = new Game({
                fieldDimensions: dimensions,
                playerName: name,
                ownColor: color,
                gid: gid,
                cid: cid,
                isLocalGame: false
            })
        },
        joinGame(gid: string, name: string){
            this.startWebSocket("join;"+gid+";" + name)
        },
        loadGame(gid: string)
        {
            this._currentGameId = gid;
            this.startWebSocket(`load;${gid}`)
        },
        startWebSocket(command: string){

            if(command !== "" && !command.startsWith("load"))
            {
                this._clientId = ""
                this._currentGameId = ""
                this._requestSent = false
            }

            const url = `${window.SOCKET_URL}/ws`;
            this.ws = new WebSocket(url)
            this.ws.onopen = () => {
                if(this._currentGameId !== "" && command === "")
                {
                    this.ws?.send(`reconnect;${this._currentGameId};${this._clientId}`)
                }
                else
                {
                    this.ws?.send(command);
                }

            }
            this.ws.onmessage = this.parseSocketMessage
        },
        parseSocketMessage(msg: any)
        {
            let state: ResponseJson = JSON.parse(msg.data);
            const toast = useToast();
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
                    break;
                case "MOVE_OK":
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentApiGame?.addValidMoves(state.moves);
                    this._currentApiGame?.setKillstreak(true);
                    break;
                case "LOAD_OK":
                    this.$router.replace("/game");
                case "SYNC":
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentApiGame?.addValidMoves([]);
                    this._currentApiGame?.setKillstreak(false);
                    this._currentApiGame?.selectPiece(-1);
                    this._requestSent = false
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
                            toast.warning(i18n.global.t('toasts.warning.unknown_error'))
                    }
                    break
                case "PERMISSION_REQUEST":
                    this._currentApiGame?.setPermissionRequest(parseInt(state.request))
                    break;
                case "PERMISSION_REQUEST_ANSWERED":
                    this._requestSent = false

                    if(state.requestAnswer.toLowerCase() === "true")
                    {
                        toast.info(i18n.global.t('toasts.info.request_accepted'))
                    }
                    else
                    {
                        toast.info(i18n.global.t('toasts.info.request_denied'))
                    }
                    break
                case "RECONNECT_OK":
                    if(this._currentApiGame === undefined)
                    {
                        this._currentApiGame = new Game()
                    }
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentApiGame?.setOwnColor(state.color);
                    break;
                case "LOCAL_OK":
                    this._currentApiGame = new Game({
                        fieldDimensions: state.gameState._fieldDimensions,
                        isLocalGame: true,
                        gid: state.gameState._gameId,
                    })
                    this._currentApiGame?.loadGameState(state.gameState);
                    this._currentGameId = state.gameState._gameId;
                    break;
                case "DLC":
                    toast.info(i18n.global.t('toasts.info.dlc'))
                    break;
                case "EXIT_REQUEST":
                    this.$emitter.emit('opponentExited');
                    break;
                case "SAVE_DATA":
                    fileDownload(JSON.stringify(state.gameState), `game-${this._currentGameId}.mld`)
                    this.$router.replace("/").then(() => {
                        this.closeWS();
                    });
                    break;
                case "EXIT_OK":
                    this.$router.replace("/").then(() => {
                        this.closeWS();
                    });
                    break;
                case "REQUEST_SENT":
                    this._requestSent = true;
                    break
                case "ABORTED":
                    this.$router.replace("/").then(() => {
                        toast.error(i18n.global.t("toasts.error.game_aborted"));
                        this.closeWS();
                    });
                    break;
                case "ANSWER_REQUEST_FIRST":
                    toast.error(i18n.global.t('toasts.error.answer_request_first'))
                    this._currentApiGame?.selectPiece(-1);
                    break
                case "NOT_YOUR_TURN":
                    toast.warning(i18n.global.t("toasts.warning.not_your_turn"))
                    this._currentApiGame?.selectPiece(-1);
                    break
                case "INVALID_ARGUMENTS":
                    toast.error(i18n.global.t('toasts.error.invalid_arguments'))
                    break
                case "INVALID_REQUEST":
                case "INVALID_PERMISSION_REQUEST":
                    toast.error(i18n.global.t('toasts.error.invalid_request'))
                    break
                case "SERVER_ERROR":
                    toast.error(i18n.global.t('toasts.error.server_error'))
                    break
                case "UNKNOWN_COMMAND":
                    toast.error(i18n.global.t('toasts.error.unknown_command'))
                    break

            }
        },
        getValidMoves(pieceId: number)
        {
            if(this._currentApiGame?._isOnKillstreak)
            {
                return;
            }
            this._currentApiGame?.selectPiece(pieceId);
            if(this._currentApiGame?._singlePlayer)
            {
                this._currentApiGame!._validMoves = []
            }
            this.ws?.send(`moves;${this._currentGameId};${this._clientId};${pieceId}`)
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
        renamePlayer(name: string, name2: string = ""){
            let cmd = `rename;${this._currentGameId};${this._clientId};${name}`;

            if(name2 !== "")
            {
                cmd += `;${name2}`
            }
            this.ws?.send(cmd)
        },
        closeWS()
        {
            switch(this.ws?.readyState)
            {
                case WebSocket.OPEN:
                    this.ws?.close(1000, `${this._currentGameId};${this._clientId}`)
                    this._currentGameId = ""
                    this._clientId = ""
                    this._currentApiGame = undefined
                    this._requestSent = false
                    break;
                case WebSocket.CLOSED:
                case WebSocket.CLOSING:
                    console.warn("WEBSOCKET ALREADY CLOSED");
                    break;
                default:
                    console.error("THIS SHOULD NOT HAPPEN");
            }

        },

    },
    getters: {
        currentGame: (state) => {
            return state._currentApiGame
        },
        requestSent: (state) => {
            return state._requestSent
        }
    }
})