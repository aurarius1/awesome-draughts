<script lang="ts">
import {useColorStore} from "@/store";
import LoadSaveGameDialog from "@/components/Dialog/LoadSaveGameDialog.vue";
import gameField from "@/components/Draughts/GameField.vue";
import GameSettingsDialog from "@/components/GameSettings/GameSettingsDialog.vue";
export default defineComponent({
  name: "TitleScreen",
  components: {GameSettingsDialog, LoadSaveGameDialog},
  setup()
  {
    const colorStore = useColorStore();
    return { getColorStore: colorStore }
  },
  computed: {
    gameField() {
      return gameField
    },
    selectedColor() {
      return this.getColorStore.currentColor;
    }
  },
  data()
  {
    return {
      loadDialogVisible: false,
      gameSettingsDialogVisible: false,
    }
  },
})
</script>

<template>
  <load-save-game-dialog
      :visible="loadDialogVisible"
      @update-visible="(newValue) => loadDialogVisible = newValue"
  />
  <game-settings-dialog
      :visible="gameSettingsDialogVisible"
      @close-me="gameSettingsDialogVisible=false"
  />
  <v-container>

    <v-row
        justify="center"
        align-content="center"
    >
      <v-col
          cols="3"
      >
        <v-list
            bg-color="rgba(0, 0, 0, 0)"
        >
          <v-list-item
              class="mt-4 mb-4"
          >
            <v-btn
                :block="true"
                size="x-large"
                :color="selectedColor.base"
                @click="gameSettingsDialogVisible=true"
            >
              {{ $t('start_game') }}
            </v-btn>
          </v-list-item>
          <v-list-item
              class="mt-4 mb-4"
          >
            <v-btn
                :block="true"
                size="x-large"
                :color="selectedColor.base"
                @click="loadDialogVisible=true"
            >
              {{ $t('load_game') }}
            </v-btn>
          </v-list-item>
          <v-list-item
              class="mt-4 mb-4"
          >
            <v-btn
                :block="true"
                size="x-large"
                :color="selectedColor.base"
                @click="$router.replace('/settings')"
            >
              {{ $t('settings') }}
            </v-btn>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
.v-card-text {
  display: flex;
  justify-content: center;
}
.v-container{
  display: flex;
  height: calc(100vh - 56px);
  align-items: center;
  align-content: center;
}

</style>