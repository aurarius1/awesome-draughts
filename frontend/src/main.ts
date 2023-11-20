import { createApp } from 'vue'
import 'vuetify/styles'


import '@fortawesome/fontawesome-free/css/all.css'
import './style.scss'
import App from './App.vue'

// Vuetify
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


import {createRouter, createWebHistory} from "vue-router";
import { TinyEmitter } from 'tiny-emitter';
import {i18n} from "@/lang";

import { createPinia } from 'pinia'

import TitleScreen from "@/components/TitleScreen.vue";
import Settings from "@/components/Settings.vue";
import Game from "@/components/Game.vue";

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import {faCheckCircle as farCheckCircle, faSun as farSun}  from '@fortawesome/free-regular-svg-icons'
import {
    faLanguage,
    faHome,
    faSun as fasSun,
    faSignOutAlt,
    faSignInAlt,
    faClose,
    faPaperclip,
    faArrowLeft,
    faUndo,
    faRedo,
    faCloudUploadAlt,
    faDownload,
    faCloudDownloadAlt,
    faUpload,
    faHandshake,
    faCrown,
    faGears,
    faEdit,
    faPlay,
    faHouse,
    faClipboard,
    faSave,
    faCheckCircle,
    faXmarkCircle
} from "@fortawesome/free-solid-svg-icons";

import Toast, {PluginOptions} from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";
import WaitingForOpponent from "@/components/WaitingForOpponent.vue";
import JoinGame from "@/components/JoinGame.vue";

library.add(farCheckCircle,
    faLanguage, faHome, fasSun,
    farSun,faSignOutAlt, faClose,
    faPaperclip, faArrowLeft, faUndo,
    faRedo, faCloudUploadAlt, faDownload,
    faCloudDownloadAlt, faUpload,faHandshake,
    faCrown, faGears, faEdit, faPlay,faHouse,
    faClipboard, faSave, faSignInAlt,faXmarkCircle, faCheckCircle

)

declare global {
    interface Window {
        API_URL: string;
        SOCKET_URL: string;
    }
}

if(window.SOCKET_URL === "")
{
    window.SOCKET_URL = window.API_URL.replace("http", "ws")
}


const app = createApp(App)
const pinia = createPinia();
export const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "Title Screen",
            component: TitleScreen
        },
        {
            path: "/settings",
            name: "Settings",
            component: Settings
        },
        {
            path: "/game",
            name: "Game",
            component: Game,
        },
        {
            path: "/waiting",
            name: "waiting",
            component: WaitingForOpponent,
        },
        {
            path: "/join/:gid",
            name: "join",
            component: JoinGame,
            props: true,
        }
    ]
})

let emitter = new TinyEmitter();

pinia.use(({ store }) => {
    store.$router = markRaw(router);
    store.$emitter = markRaw(emitter)
})

app.use( pinia)

app.config.globalProperties.$emitter = emitter
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(i18n)


const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'fa',
        aliases,
        sets: {
            fa,
        }
    },
    theme: {
        defaultTheme: 'dark',
    }
})
app.use(vuetify)


app.use(router)


const toastOptions: PluginOptions = {
    transition: "Vue-Toastification__bounce",
    maxToasts: 20,
    newestOnTop: true
}
app.use(Toast, toastOptions);

app.mount('#app')
