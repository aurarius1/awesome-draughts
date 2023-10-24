import {defineStore} from "pinia"
import colors from 'vuetify/lib/util/colors'
import { useLocalStorage } from '@vueuse/core'
import {i18n} from "@/lang";


export const useColorStore = defineStore('colorStore',{
    state: (): ColorState =>  {
        return {
            color: useLocalStorage("color", colors.blue),
        }
    },
    actions: {
        changeColor(newColor: Object){
            console.log(newColor);
            this.color = newColor
        }
    },
    getters: {
        currentColor: (state) => state.color,
    }
})

export const useLanguageStore = defineStore('languageStore',{
    state: (): LanguageState =>  {
        return {
            language: useLocalStorage("language", navigator.language),
        }
    },
    actions: {
        changeLanguage(newLanguage: String){
            this.language = newLanguage
            i18n.global.locale = this.language
        }
    },
    getters: {
        currentLanguage: (state) => state.language,
    }
})

export const useThemeStore = defineStore('themeStore',{
    state: (): ThemeState =>  {
        return {
            theme: useLocalStorage("theme", "dark"),
        }
    },
    actions: {
        changeTheme(newTheme: String){
            this.theme = newTheme
        }
    },
    getters: {
        currentTheme: (state) => state.theme,
    }
})