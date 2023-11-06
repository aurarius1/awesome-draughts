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


import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
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
import {faCheckCircle, faSun as farSun}  from '@fortawesome/free-regular-svg-icons'
import {
    faLanguage,
    faHome,
    faSun as fasSun,
    faSignOutAlt,
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
} from "@fortawesome/free-solid-svg-icons";

import Toast, {PluginOptions} from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

library.add(faCheckCircle,
    faLanguage, faHome, fasSun,
    farSun,faSignOutAlt, faClose,
    faPaperclip, faArrowLeft, faUndo,
    faRedo, faCloudUploadAlt, faDownload,
    faCloudDownloadAlt, faUpload,faHandshake,
    faCrown, faGears, faEdit, faPlay,faHouse

)

const app = createApp(App)
app.use( createPinia())
app.config.globalProperties.$emitter = new TinyEmitter()
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

const router = createRouter({
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
            component: Game
        }
    ]
})
app.use(router)


const toastOptions: PluginOptions = {
    transition: "Vue-Toastification__bounce",
    maxOpened: 20,
    newestOnTop: true
}
app.use(Toast, toastOptions);

app.mount('#app')
