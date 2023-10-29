<script lang="ts">
import {useColorStore} from "@/store";
import LoadSaveGameDialog from "@/components/LoadSaveGameDialog.vue";
export default defineComponent({
  name: "TitleScreen",
  components: {LoadSaveGameDialog},
  setup()
  {
    const colorStore = useColorStore();
    return { colorStore }
  },
  computed: {
    selectedColor() {
      return this.colorStore.currentColor;
    }
  },
  data()
  {
    return {
      loadDialogVisible: false
    }
  },
  methods: {
  }
})
</script>

<template>
  <load-save-game-dialog
      :visible="loadDialogVisible"
      @update-visible="(newValue) => loadDialogVisible = newValue"

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
                @click="$router.push('game')"
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
                @click="$router.push('/settings')"
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