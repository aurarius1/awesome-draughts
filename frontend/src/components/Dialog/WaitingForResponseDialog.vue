<script lang="ts">
import {defineComponent} from 'vue'
import {useGameStore} from "@/store";

export default defineComponent({
  name: "WaitingForResponseDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup(){
    const colorStore = useColorStore();
    return {colorStore}
  },
  methods:{
    getColor(color: string = "base")
    {
      return this.colorStore.currentColor[color]
    }
  }
})
</script>

<template>
<v-dialog
  :persistent="true"
  v-model="visible"
  width="500"
>
   <v-card>
     <v-card-title>
       {{ $t('waiting_for_response')}}
     </v-card-title>
     <v-card-text
         class="test"
     >
       <v-progress-circular
           :indeterminate="true"
           size="100"
           width="8"
           class="mb-2"
           :color="getColor()"
           style="overflow: hidden"
       />
     </v-card-text>
   </v-card>




</v-dialog>

</template>

<style scoped lang="scss">
.test{
  display: flex;
  justify-content: center;

  align-content: center;
  align-self: center;
  align-items: center;
}
</style>