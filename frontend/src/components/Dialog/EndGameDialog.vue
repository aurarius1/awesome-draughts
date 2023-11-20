<script lang="ts">
import {defineComponent} from 'vue'
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import {useGameStore} from "@/store";

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
    }
  },
  computed:
  {
    draw(){
      const gameStore = useGameStore();
      return gameStore.currentGame?._draw ?? false;
    },
    endScreenMessage(){
      const gameStore = useGameStore();

      if(gameStore.currentGame === undefined)
        return "";


      let currentPlayer = gameStore.currentGame?._currentPlayer;
      if(this.draw)
      {
        return this.$t('player.draw')
      }

      if(gameStore.currentGame?._singlePlayer ?? true)
      {
        let playerName = ""
        if(currentPlayer !== undefined) {
          playerName = gameStore.currentGame?._playerNames[currentPlayer] ?? "";
        }
        return this.$t('player.sp_end', {name: playerName})
      }
      else
      {
        if(currentPlayer === gameStore.currentGame?._ownColor)
        {
          return this.$t(`player.wins`)
        }
        return this.$t('player.loses')

      }
    }
  },
  methods: {
    getColorStore(){
      return this.colorStore;
    },
    goToTitleScreen(){
      const gameStore = useGameStore();

      this.$router.replace('/').then(() => {
        gameStore.closeWS();
      })
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
        {{ endScreenMessage }}
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