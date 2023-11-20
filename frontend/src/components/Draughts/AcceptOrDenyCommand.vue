<script lang="ts">
import {defineComponent, PropType} from 'vue'
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue"
import {useGameStore} from "@/store"
import {PermissionRequest} from "@/globals.ts"
import colors from "@/VuetifyColors.ts"

export default defineComponent({
  name: "AcceptOrDenyCommand",
  components: {VFontAwesomeBtn},
  props: {
    request: {
      type: Number as PropType<PermissionRequest>,
      default: PermissionRequest.Nothing,
    }
  },
  computed: {
    requestQuestion(){
      let param = ""
      switch(this.request)
      {
        case PermissionRequest.Undo:
          param = this.$t('moves.undo')
          break
        case PermissionRequest.Redo:
          param = this.$t('moves.redo')
          break
        case PermissionRequest.Draw:
          param = this.$t('moves.draw')
          break
        default:
          return ""
      }
      return this.$t('moves.request', {request: param})
    }
  },
  methods:
  {
    colors(){
      return colors;
    },
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
    <v-card-actions
      class="justify-space-between"
    >
      <v-font-awesome-btn
          :icon="['fas', 'fa-check-circle']"
          :text="$t('moves.accept')"
          icon-size="lg"
          :btn-color="colors().green.base"
          @click="answerRequest(true)"
          btn-variant="elevated"
          btn-rounded="2"
      />
      <v-font-awesome-btn
          :icon="['fas', 'fa-xmark-circle']"
          :text="$t('moves.deny')"
          icon-size="lg"
          :btn-color="colors().red.base"
          btn-variant="elevated"
          @click="answerRequest(false)"
          btn-rounded="2"
        />
    </v-card-actions>
  </v-card>
</v-container>
</template>

<style scoped lang="scss">

</style>