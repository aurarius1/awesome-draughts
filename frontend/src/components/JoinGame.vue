<script lang="ts">
import {defineComponent} from 'vue'
import {useGameStore} from "@/store";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import NameField from "@/components/TextFields/NameField.vue";

export default defineComponent({
  name: "JoinGame",
  components: {NameField, VFontAwesomeBtn},
  setup(){
    const colorStore = useColorStore()
    return {colorStore}
  },
  props: {
    gid:{
      type: String,
      default: "DEFAULT",
    }
  },
  data() {
    return{
      name: "Bob",
    }
  },
  methods: {
    joinGame()
    {
      if(this.name.length <= 0)
        return;


      const gameStore = useGameStore();
      gameStore.joinGame(this.gid, this.name);
    },
    getColor(color: string)
    {
      return this.colorStore.currentColor[color]
    }
  }
})
</script>

<template>

  <v-container
    class="ml-join-container"
  >
    <v-card
        width="30vw"
        class="ml-join-card"
    >
      <v-card-title
          class="mb-2"
      >
        {{ $t('join_game.title') }}
      </v-card-title>
      <v-card-text>
        <name-field
          :name="name"
          @updated="(value: string) => {console.log(value); name=value}"
        />
      </v-card-text>
      <v-card-actions
        class="justify-center"
      >
        <v-font-awesome-btn
            :icon="['fas', 'fa-sign-in-alt']"
            :text="$t('join_game.join')"
            :icon-color="getColor('base')"
            @click="joinGame()"
        />
      </v-card-actions>
    </v-card>

  </v-container>

</template>

<style scoped lang="scss">
@import "@/scss/ml-dialog";
.ml-join-container{
  height: 100%;
  width: 100%;
  max-width: 100%;
  margin-top: 60px;
  display: flex;
  justify-content: center;
  .ml-join-card{
    text-align: center;
  }
}

</style>