<script lang="ts">
import {defineComponent} from 'vue'
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "AcceptOrDenyCommand",
  components: {VFontAwesomeBtn},
  props: {
    request: {
      type: String,
      default: 0,
      validator(value: String) {
        return value === "0" || value === "1" || value === "2" || value === "3" || value === "4";
      }
    }
  },
  computed: {
    requestQuestion(){
      let param = ""
      switch(this.request)
      {
        case "1":
          param = this.$t('moves.undo')
          break
        case "2":
          param = this.$t('moves.redo')
          break
        case "3":
          param = this.$t('moves.draw')
          break
        default:
          return ""
      }
      console.log(param)
      return this.$t('moves.request', {request: param})
    }
  },
  methods:
  {
    answerRequest(accept:boolean = true)
    {
      const gameStore = useGameStore();
      gameStore.answer(accept);
    }
  }
})
</script>

<template>
<v-container>
  <v-card>
    <v-card-text>
      {{ requestQuestion }}
    </v-card-text>
    <v-card-actions>
      <v-font-awesome-btn
          :text="$t('moves.accept')"
          @click="answerRequest(true)"
      />
      <v-font-awesome-btn
          :text="$t('moves.deny')"
          @click="answerRequest(false)"
        />
    </v-card-actions>
  </v-card>
</v-container>
</template>

<style scoped lang="scss">

</style>