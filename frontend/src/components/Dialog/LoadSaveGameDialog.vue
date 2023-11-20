<script lang="ts">
import {defineComponent} from 'vue'
import {useGameStore} from "@/store";
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import axios from 'axios';


export default defineComponent({
  name: "LoadSaveGameDialog",
  components: {VFontAwesomeBtn, FontAwesomeBtn},
  setup(){
    const colorStore = useColorStore()
    const gameStore = useGameStore()
    const toast = useToast()
    return {getColorStore: colorStore, gameStore, toast}
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

          axios.post("https://localhost:32768/loadGame", fileContent, {
            headers: {
              'Content-Type': 'application/json'
            }
          }).then((response) => {
            this.getGameStore().loadGame(response.data)

          }).catch((error) => {
            this.fileUploaded = false
            this.uploadedGameState = []
            if(error.response.status === 406)
            {
              this.toast.error(this.$t("toasts.error.game_save_invalid"))
            }
            else if(error.response.status === 400)
            {
              this.toast.error(this.$t("toasts.error.gamestate_invalid"))
            }
            else if(error.response.status === 423)
            {
              this.toast.error(this.$t("toasts.error.game_full"))
            }
            else {
              this.toast.error(this.$t("toasts.error.something_went_wrong"))
            }
          })
        })
      }
    }
  },
  data() {
    return {
      loadFromFile: false,
      fileUploaded: false,
      uploadedGameState: [] as Array<File>
    }
  },
  methods: {
    getColor(color: string = "base"){
      return this.getColorStore.currentColor[color]
    },
    getGameStore()
    {
      return this.gameStore;
    },
    updateVisible() {
      this.loadFromFile = false
      this.fileUploaded = false
      this.$emit('updateVisible', false)
    },
    loadLocal()
    {
      this.loadFromFile = true
    },
    loadRemote()
    {
      axios.get("https://localhost:32768/loadRemoteGame", {params: {gameId: "-1"}}).then((_) => {
        this.toast.success(this.$t('toasts.success.ctf_flag',{ctf: "LosCTF{D3S1GN_P4773RNS_1S_C00L}"}))
      }).catch((error) => {
        if(error.response.status === 402)
        {
          this.toast.info(this.$t('toasts.info.dlc'))
        }
        else
        {
          this.toast.error(this.$t('toasts.error.something_went_wrong'))
        }
      })

    },
    goBack()
    {
      this.loadFromFile = false
      this.fileUploaded = false
    },

  }

})
</script>

<template>
  <v-dialog
      width="500"
      v-model="visible"
      :persistent="true"
  >
    <v-card>
      <v-card-title>
        <v-row>
          <v-col
              cols="10"
          >
            {{ $t('load_dialog.title')}}
          </v-col>
          <v-col
            cols="2"
            class="ml-dialog-title-btn-group"
          >
            <v-tooltip
                v-if="loadFromFile"
                :text="$t('load_dialog.tooltips.back_btn')"
                location="left"
            >
              <template v-slot:activator="{ props }">
                <font-awesome-btn
                    class="me-4"
                    v-bind="props"
                    :icon="['fas', 'fa-arrow-left']"
                    @click="goBack()"
                />
              </template>
            </v-tooltip>

            <font-awesome-btn

                :icon="['fas', 'fa-close']"
                @click="updateVisible()"
            />
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text v-if="loadFromFile">
        <v-overlay
            v-model="fileUploaded"
            :contained="true"
            class="align-center justify-center"
        >
          <v-progress-circular
            indeterminate
            size="70"
            width="3"
            :color="getColor('darken1')"
          />
        </v-overlay>

        <v-file-input
            variant="outlined"
            :label="$t('load_dialog.upload_gamestate')"
            prepend-icon=""
            :show-size="true"
            :counter="true"
            :chips="true"
            accept=".mld"
            compact
            v-model="uploadedGameState"
        >
          <template v-slot:append-inner>
            <font-awesome-icon :icon="['fas', 'paperclip']" size="lg"/>
          </template>
        </v-file-input>
      </v-card-text>
      <v-card-text class="ml-dialog-text" v-else>
        {{ $t("load_dialog.description") }}
      </v-card-text>
      <v-card-actions
          v-if="!loadFromFile"
          class="ml-dialog-actions evenly"
      >
        <v-font-awesome-btn
            :btn-color="getColor()"
            btn-variant="outlined"
            @click="loadLocal()"
            :icon="['fas', 'fa-upload']"
            icon-text-spacing="me-2"
            iconSize="lg"
            :text="$t('load_dialog.load')"
            :tooltip-text="$t('load_dialog.tooltips.load_local')"
            tooltip-location="bottom"
        />
        <v-font-awesome-btn
            :btn-color="getColor()"
            btn-variant="elevated"
            @click="loadRemote()"
            :icon="['fas', 'fa-cloud-download-alt']"
            icon-text-spacing="me-2"
            iconSize="lg"
            :text="$t('load_dialog.load')"
            :tooltip-text="$t('load_dialog.tooltips.load_remote')"
            tooltip-location="bottom"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
@import '@/scss/ml-dialog';



</style>