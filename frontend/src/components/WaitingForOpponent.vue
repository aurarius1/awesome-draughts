<script lang="ts">
import {defineComponent} from 'vue'
import {useGameStore} from "@/store";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";

export default defineComponent({
  name: "WaitingForOpponent",
  components: {FontAwesomeBtn, FontAwesomeIcon, VFontAwesomeBtn},
  setup() {
    const colorStore = useColorStore();
    const toast = useToast();
    return {colorStore, toast}
  },
  data(){
    return {
    }
  },
  computed: {
    gid(){
      const gameStore = useGameStore();
      return gameStore._currentGameId;
    },
    url(){
      // TODO THIS SHOULD NOT BE HARDCODED
      return "http://localhost:3000/join/" + this.gid;
    }
  },
  methods: {
    getColor(color: string){
      return this.colorStore.currentColor[color]
    },
    copyToClipboard(){
      navigator.clipboard.writeText(this.url).then(() => {
        this.toast.info(this.$t('toasts.info.copied'))
      })
    },
    leaveGame(){
      const gameStore = useGameStore();

      this.$router.replace("/").then(() => {
        gameStore.closeWS();
      });
    }
  }
})
</script>

<template>
  <v-container
    class="ml-waiting-container"
  >
    <v-card
      width="30vw"
      class="ml-waiting-card"
    >
      <v-card-title
        class="mb-2"
      >
        {{ $t('waiting_for_opponent.waiting') }}
        <v-progress-linear
            :indeterminate="true"
            :color="getColor('lighten1')"
            :absolute="true"
        />
      </v-card-title>
      <v-card-text>

        <h3
            class="mb-2"
        >
          {{ $t("waiting_for_opponent.description")}}
        </h3>

        <v-text-field
          v-model="url"
          :readonly="true"
          variant="outlined"
        >
          <template v-slot:append-inner>
            <font-awesome-btn
                :icon="['fas', 'fa-clipboard']"
                size="lg"
                class="me-2"
                @click="copyToClipboard()"
            />
          </template>
        </v-text-field>

      </v-card-text>
      <v-card-actions
        class="ml-dialog-actions center"
      >
        <v-font-awesome-btn
            :text="$t('waiting_for_opponent.leave')"
            :icon="['fas', 'fa-sign-out-alt']"
            :icon-color="getColor('base')"
            @click="leaveGame()"
        />
      </v-card-actions>
    </v-card>


  </v-container>
</template>

<style scoped lang="scss">
@import "@/scss/ml-dialog";
.ml-waiting-container{
  max-width: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
  margin-top: 32px;

  .ml-waiting-card{
    text-align: center;
  }
}
</style>