import en from "./en.json"
import de from "./de.json"
import {createI18n, type I18nOptions} from "vue-i18n";



export const i18n = createI18n<true, I18nOptions>({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en: en,
        de: de
    },

})