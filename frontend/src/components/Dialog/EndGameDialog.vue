<script lang="ts">
import {defineComponent} from 'vue'
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";

export default defineComponent({
  name: "EndGameDialog",
  components: {VFontAwesomeBtn, FontAwesomeBtn},
  setup(){
    const colorStore = useColorStore()
    return {colorStore}
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ""
    },
    localizeText: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getColorStore(){
      return this.colorStore;
    },
    goToTitleScreen(){
      this.$router.replace('/')
    }
  }
})
</script>

<template>
  <v-dialog
    v-model="visible"
    :persistent="true"
    width="fit-content"
  >
    <v-card>

      <v-card-text
        class="ml-dialog-text text-h4"
      >
        {{  localizeText ? $t(text) : text }}
      </v-card-text>
      <v-card-actions
          class="ml-dialog-actions center"
      >
        <v-font-awesome-btn
          :text="$t('end_game_dialog.go_home')"
          :icon="['fas', 'fa-house']"
          icon-text-spacing="me-2"
          btn-variant="elevated"
          :btn-color="getColorStore().currentColor.lighten1"
          @click="goToTitleScreen()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>





</template>

<style scoped lang="scss">
@import '@/scss/ml-dialog';

</style>