<script lang="ts">
import {defineComponent} from 'vue'
import {useGameStore} from "@/store";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";

export default defineComponent({
  name: "JoinGame",
  components: {VFontAwesomeBtn},
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
<div
    class="ml-join-container"
>
  <v-container
    width="30vw"
  >
    <v-row>
      <v-col>
        <v-text-field
            v-model="name"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        class="ml-dialog-actions center"
      >
        <v-font-awesome-btn
            :icon="['fas', 'fa-save']"
            :text="this.$t('join')"
            :icon-color="getColor('base')"
            @click="joinGame()"
        />
      </v-col>
    </v-row>

  </v-container>
</div>
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
}
</style>