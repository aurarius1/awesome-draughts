
<script lang="ts">
import { useTheme } from 'vuetify'

export default defineComponent({
  setup()
  {
    const languageStore = useLanguageStore();
    const themeStore = useThemeStore();
    const vuetifyTheme = useTheme()
    return {languageStore, themeStore, vuetifyTheme}
  },
  components: {
  },
  beforeCreate()
  {
    this.vuetifyTheme.global.name.value = this.themeStore.currentTheme;
    this.$i18n.locale = this.languageStore.currentLanguage;
  },
  created(){
  },
  beforeMount()
  {

  }

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
