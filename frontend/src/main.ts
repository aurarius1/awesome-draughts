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
import colors from 'vuetify/lib/util/colors'

import {createRouter, createWebHistory} from "vue-router";
import { TinyEmitter } from 'tiny-emitter';
import {i18n} from "@/lang";

import { defineStore, createPinia } from 'pinia'
import {ColorState} from "@/vite-env";

import TitleScreen from "@/components/TitleScreen.vue";
import Settings from "@/components/Settings.vue";

export const useColorStore = defineStore('colorStore',{
    state: (): ColorState =>  {
        return {
                color: colors.blue
            }
        },
    actions: {
        changeColor(newColor){
            console.log(newColor);
            this.color = newColor
        }
    },
    getters: {
        currentColor: (state) => state.color,

    }

})



const app = createApp(App)
app.use( createPinia())
app.config.globalProperties.$emitter = new TinyEmitter()


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
        }
    ]
})
app.use(router)


app.mount('#app')
