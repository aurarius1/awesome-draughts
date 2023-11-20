<script lang="ts">
import {defineComponent} from 'vue'
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import GameSettings from "@/components/GameSettings/GameSettings.vue";
import RemoteGameSettings from "@/components/GameSettings/RemoteGameSettings.vue";

export default defineComponent({
  name: "GameSettingsDialog",
  components: {GameSettings, FontAwesomeBtn, VFontAwesomeBtn},
  emits: {
    closeMe(){}
  },
  setup(){
    const colorStore = useColorStore()
    const toast = useToast()
    return {colorStore, toast}
  },
  props:{
    visible: {
      type: Boolean,
      default: false
    },
  },
  data(){
    return{
      startGame: false,
      local: true,
    }
  },
  methods: {
    getColorStore(){
      return this.colorStore;
    }
  },


})
</script>

<template>
  <v-dialog
    width="40vw"
    v-model="visible"
    :persistent="true"

  >
    <v-card>
      <v-card-title>
        <v-row
          class="align-center"
        >
          <v-col
            cols="11"
          >
            {{ $t('game_settings_dialog.title')}}
          </v-col>
          <v-col
            cols="1"
            class="ml-btn-end"
          >
            <font-awesome-btn
                :icon="['fas', 'fa-close']"
                @click="$emit('closeMe')"
            />
          </v-col>
        </v-row>
        <v-row
            class="align-center"
        >
          <v-col
              class="ml-dialog-actions evenly"
          >
            <v-font-awesome-btn
                :btn-color="getColorStore().currentColor.lighten1"
                :icon="['fas', 'fa-play']"
                :text="$t('game_settings_dialog.local')"
                :btn-variant="local ? 'elevated' : undefined"
                btn-rounded="lg"
                @click="local=true;"

            />
            <v-font-awesome-btn
                :btn-color="getColorStore().currentColor.lighten1"
                :icon="['fas', 'fa-play']"
                :text="$t('game_settings_dialog.remote')"
                :btn-variant="!local ? 'elevated' : undefined"
                btn-rounded="lg"
                @click="local=false;"
            />
          </v-col>
        </v-row>

      </v-card-title>
      <v-card-text>
        <game-settings
            :start-new-game="startGame"
            :local="local"
            @start-not-possible="() => startGame=false"
        />

      </v-card-text>
      <v-card-actions
        class="justify-end"
      >
        <v-font-awesome-btn
          :icon="['fas', 'fa-play']"
          :text="$t('game_settings_dialog.start_game')"
          :btn-color="getColorStore().currentColor.lighten1"
          btn-variant="elevated"
          icon-text-spacing="me-2"
          @click="() => {startGame = true}"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
@import '@/scss/ml-dialog';
.ml-btn-end{
  display: flex;
  justify-content: end;
}
</style>