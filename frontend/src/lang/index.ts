import en from "./en.json"
import de from "./de.json"
import {createI18n} from "vue-i18n";

export const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        en: en,
        de: de
    },

})