
<script lang="ts">
import { useTheme } from 'vuetify'
import {useGameStore} from "@/store";
import {useRoute} from "vue-router";

export default defineComponent({
  setup()
  {
    const languageStore = useLanguageStore();
    const themeStore = useThemeStore();
    const vuetifyTheme = useTheme()
    return {getLanguageStore: languageStore, getThemeStore: themeStore, getVuetifyTheme: vuetifyTheme}
  },
  components: {
  },
  beforeCreate()
  {
    this.getVuetifyTheme.global.name.value = this.getThemeStore.currentTheme;
    this.$i18n.locale = this.getLanguageStore.currentLanguage;
    if(this.$router.currentRoute.path === "/game")
    {
      window.onbeforeunload = (event) => {
        return "";
      }
    }
    else
    {
      window.onbeforeunload = null;
    }


  },

})
</script>


<template>
  <v-toolbar
    :title="$t('draughts-title')"
    density="comfortable"
  >
  </v-toolbar>
  <router-view />
</template>

<style lang="scss" scoped>
</style>
