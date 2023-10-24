<script lang="ts">
import GameField from "@/components/Draughts/GameField.vue";

export default defineComponent({
  name: "Game.vue",
  components: {GameField}
})
</script>

<template>
  <div
    class="test"
  >
    <game-field />
    <v-card
      height="1030px"
      width="300px"
      elevation="6"
      class="ml-12"
    >
      detail_card
    </v-card>
  </div>
</template>

<style scoped lang="scss">
.test{
  display: flex;
  height: calc(100vh - 56px);
  align-items: center;
  top: 56px;
  justify-content: center;
}
</style>