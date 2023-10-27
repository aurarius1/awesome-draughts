import {defineStore} from "pinia"
import colors from 'vuetify/lib/util/colors'
import { useLocalStorage } from '@vueuse/core'
import {i18n} from "@/lang";
import {Locale} from "vue-i18n";



export const useColorStore = defineStore('colorStore',{
    state: () =>  {
        return {
            color: useLocalStorage("color", colors.blue),
        }
    },
    actions: {
        changeColor(newColor: Color){
            console.log(newColor);
            this.color = newColor
        }
    },
    getters: {
        currentColor(state): Color{
            return state.color
        }
    }
})

export const useLanguageStore = defineStore('languageStore',{
    state: () =>  {
        return {
            language: useLocalStorage("language", navigator.language),
        }
    },
    actions: {
        changeLanguage(newLanguage: string){
            let languageMatched: boolean = false;

            i18n.global.availableLocales.forEach((locale) => {
                if(locale === newLanguage)
                {
                    languageMatched = true;
                    this.language = newLanguage
                    i18n.global.locale = locale
                }
            })

            if(!languageMatched)
            {
                // TODO display toast
            }

        }
    },
    getters: {
        currentLanguage: (state) => state.language,
    }
})

export const useThemeStore = defineStore('themeStore',{
    state: () =>  {
        return {
            theme: useLocalStorage("theme", "dark"),
        }
    },
    actions: {
        changeTheme(newTheme: string){
            this.theme = newTheme
        }
    },
    getters: {
        currentTheme: (state) => state.theme,
    }
})