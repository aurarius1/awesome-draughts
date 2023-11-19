<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "NameField",
  emits: {
    updated(value: string){
      return true
    }
  },
  props:{
    name: {
      type: String,
      default: "Eve",
    },

  },
  data() {
    return{
      _name: this.name,
      rules: {
        notempty: (value: string) => !!value && value.length > 0 || this.$t('validator.enter_name'),
      }
    }
  },
})
</script>

<template>
  <v-text-field
      :hide-details="name.length > 0"
      :rules="[rules.notempty]"
      v-model="_name"
      @update:model-value="(val) => {$emit('updated', val)}"
  />
</template>

<style scoped lang="scss">

</style>