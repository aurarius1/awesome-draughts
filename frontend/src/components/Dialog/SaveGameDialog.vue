<script lang="ts">
import {defineComponent} from 'vue'
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";

export default defineComponent({
  name: "SaveGameDialog",
  components: {FontAwesomeBtn, VFontAwesomeBtn},
  setup()
  {
    const colorStore = useColorStore();
    return {colorStore}
  },
  emits:{
    closeMe(){return true},
    saveLocal(){return true},
    saveRemote(){return true},
    exit(){return true}

  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getColor(color: string = 'lighten1'){
      return this.colorStore.currentColor[color]
    },
  }
})
</script>

<template>
  <v-dialog
      v-model="visible"
      width="500"
      :persistent="true"
  >
    <v-card
        class="ml-save-dialog"
    >
      <v-card-title>
        <v-row>
          <v-col
              cols="11"
          >
            {{ this.$t('exit_dialog.title')}}
          </v-col>
          <v-col>
            <font-awesome-btn
                :icon="['fas', 'fa-close']"
                @click="$emit('closeMe')"
            />
          </v-col>
        </v-row>

      </v-card-title>
      <v-card-text
          class="ml-save-dialog-text"
      >
        {{ this.$t('exit_dialog.description') }}
      </v-card-text>
      <v-card-actions
          class="ml-dialog-actions evenly"
      >
        <v-font-awesome-btn
            :btn-color="getColor()"
            btn-variant="outlined"
            @click="$emit('saveLocal')"
            :icon="['fas', 'fa-download']"
            iconSize="lg"
            :text="this.$t('exit_dialog.save')"
            icon-text-spacing="me-2"
            :tooltip-text="this.$t('exit_dialog.tooltips.save_local')"
            tooltip-location="bottom"
        />
        <v-font-awesome-btn
            :btn-color="getColor()"
            btn-variant="elevated"
            @click="$emit('saveRemote')"
            :icon="['fas', 'fa-cloud-upload-alt']"
            iconSize="lg"
            :text="this.$t('exit_dialog.save')"
            icon-text-spacing="me-2"
            :tooltip-text="this.$t('exit_dialog.tooltips.save_remote')"
            tooltip-location="bottom"
        />
        <v-font-awesome-btn
            :btn-color="getColor()"
            btn-variant="plain"
            @click="$emit('exit')"
            :icon="['fas', 'fa-sign-out-alt']"
            iconSize="lg"
            :text="this.$t('exit_dialog.exit')"
            icon-text-spacing="me-2"
            :tooltip-text="this.$t('exit_dialog.tooltips.exit')"
            tooltip-location="bottom"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
@import "@/scss/ml-dialog"
</style>