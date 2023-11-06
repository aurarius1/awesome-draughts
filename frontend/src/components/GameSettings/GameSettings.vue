<script lang="ts">
import {defineComponent, renderList} from 'vue'
import NameSelection from "@/components/GameSettings/NameSelection.vue";
import {PlayerNames} from "@/draughts";
import {PropType} from "vue/dist/vue";

export default defineComponent({
  name: "GameSettings",
  emits: {
    leaveGameSettings(){return true;}
  },
  watch: {
    startNewGame(startGame){
      if(startGame)
      {
        this.$emitter.emit('player-name-changed', "white", this._playerNames.white)
        this.$emitter.emit('player-name-changed', "black", this._playerNames.black)
      }
    },
    playerNames(newValue){
      this._playerNames = newValue;
    }
  },
  setup()
  {
    const colorStore = useColorStore()
    return {colorStore}
  },
  components: {NameSelection},
  props: {
    playerNames: {
      type: Object as PropType<PlayerNames>,
      default: {
        "white": "Alice",
        "black": "Bob"
      }
    },
    isGameDialog: {
      type: Boolean,
      default: true,
    },
    startNewGame: {
      type: Boolean,
      default: false,
    }
  },
  data(){
    return{
      _playerNames: this.playerNames
    }
  },
  computed: {
  },
  methods: {
    renderList,
    getColorStore()
    {
      return this.colorStore
    },
    changePlayerName(playerType: string, playerName: string){
      if(this._playerNames === undefined)
      {
        this._playerNames = {}
      }
      this._playerNames[playerType] = playerName

      if(!this.isGameDialog)
      {
        this.$emitter.emit('player-name-changed', playerType, playerName)
      }

    }
  }
})
</script>

<template>
  <name-selection
      v-bind:default-names="_playerNames"
      @player-name-changed="changePlayerName"
  />
  <v-btn
      v-if="!isGameDialog"
      @click="$emit('leaveGameSettings')"
      :color="getColorStore().currentColor.accent1"
      class="ml-leave-game-settings"
  >
    {{ this.$t("exit_game_settings") }}
  </v-btn>
</template>

<style scoped lang="scss">
.ml-leave-game-settings
{
  margin-top: 12px;
}
</style>