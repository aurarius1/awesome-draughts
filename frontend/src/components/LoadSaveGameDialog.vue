<script lang="ts">
import {defineComponent, StyleValue} from 'vue'
import {useGameStore} from "@/store";

export default defineComponent({
  name: "LoadSaveGameDialog",
  setup(){
    const colorStore = useColorStore()
    const gameStore = useGameStore()
    const toast = useToast()
    return {colorStore, gameStore, toast}
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    }
  },
  watch: {
    uploadedGameState(gameState: File[])
    {
      if(gameState.length !== 0)
      {
        this.fileUploaded = true
        gameState[0].text().then((fileContent) => {

          if(!this.gameStore.loadGame(fileContent))
          {
            this.toast.error(this.$t('game_state_invalid'))
            this.fileUploaded = false
            this.uploadedGameState = [];
          }
          else
          {
            this.$router.push("/game")
          }
        })
      }
    }
  },
  data() {
    return {
      closeBtnHovered: false,
      backBtnHovered: false,
      loadFromFile: false,
      loadFromServer: false,
      fileUploaded: false,
      uploadedGameState: [] as Array<File>
    }
  },
  computed: {
    btnHoveredStyle(): StyleValue{
      return {
        cursor: "pointer",
        color: this.getColor(),

      }
    },
  },
  methods: {
    getBtnStyle(param: string)
    {
      if(!this.closeBtnHovered && param === "close")
        return {}
      if(!this.backBtnHovered && param === "back")
        return {}
      return this.btnHoveredStyle
    },
    getColor(color: string = "base"){
      return this.colorStore.currentColor[color]

    },
    updateVisible() {
      this.closeBtnHovered = false
      this.loadFromFile = false
      this.loadFromServer = false
      this.backBtnHovered = false
      this.fileUploaded = false
      this.$emit('updateVisible', false)
    },
    loadLocal()
    {
      this.loadFromFile = true
    },
    loadRemote()
    {
      // TODO
      this.loadFromServer = true
      this.toast.warning("HALLO :)")
    },
    goBack()
    {
      this.loadFromFile = false
      this.loadFromServer = false
      this.backBtnHovered = false
      this.closeBtnHovered = false
      this.fileUploaded = false
    },

  }

})
</script>

<template>
  <v-dialog
      width="500"
      v-model="visible"
  >
    <v-card>
      <v-card-title>
        <v-row>
          <v-col
              cols="10"
          >
            {{ $t('load_game')}}
          </v-col>
          <v-spacer v-if="!loadFromFile && !loadFromServer"/>
          <v-col  v-else>
            <font-awesome-icon
                :icon="['fas', 'fa-arrow-left']"
                @mouseover="backBtnHovered=true"
                @mouseleave="backBtnHovered=false"
                :style="getBtnStyle('back')"
                @click="goBack()"
            />
          </v-col>
          <v-col>
            <font-awesome-icon
                :icon="['fas', 'fa-close']"
                @mouseover="closeBtnHovered=true"
                @mouseleave="closeBtnHovered=false"
                :style="getBtnStyle('close')"
                @click="updateVisible()"
            />
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text v-if="loadFromFile">
        <v-overlay
            v-model="fileUploaded"
            contained
            class="align-center justify-center"
        >
          <v-progress-circular
            indeterminate
            size="70"
            width="3"
            :color="getColor('darken1')"
          >

          </v-progress-circular>
        </v-overlay>



        <v-file-input
            variant="outlined"
            :label="$t('upload_gamestate')"
            prepend-icon=""
            :show-size="true"
            :counter="true"
            :chips="true"
            accept=".aw"
            compact
            v-model="uploadedGameState"
        >
          <template v-slot:append-inner>
            <font-awesome-icon :icon="['fas', 'paperclip']" size="lg"/>
          </template>
        </v-file-input>
      </v-card-text>
      <v-card-text v-else-if="loadFromServer">

      </v-card-text>
      <v-card-text v-else>
        {{ $t("load_game_desc") }}
      </v-card-text>
      <v-card-actions v-if="loadFromServer">

      </v-card-actions>
      <v-card-actions v-else-if="loadFromFile">

      </v-card-actions>
      <v-card-actions v-else>
        <v-tooltip
            :text="$t('load_local_tooltip')"
        >
          <template v-slot:activator="{ props }">
            <v-btn
                :color="getColor()"
                variant="outlined"
                v-bind="props"
                @click="loadLocal()"
            >
              {{ $t('load_local') }}
            </v-btn>
          </template>

        </v-tooltip>
        <v-tooltip
            :text="$t('load_remote_tooltip')"
        >
          <template v-slot:activator="{ props }">
            <v-btn
                :color="getColor()"
                variant="elevated"
                v-bind="props"
                @click="loadRemote()"
            >
              {{ $t('load_remote') }}
            </v-btn>
          </template>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.v-card-actions{
  display: flex;
  justify-content: space-evenly;
}
</style>