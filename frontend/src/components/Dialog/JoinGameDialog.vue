<script lang="ts">
import {defineComponent} from 'vue'
import FontAwesomeBtn from "@/components/Buttons/FontAwesomeBtn.vue";
import VFontAwesomeBtn from "@/components/Buttons/VFontAwesomeBtn.vue";
import {useGameStore} from "@/store";

export default defineComponent({
  name: "JoinGameDialog",
  components: {VFontAwesomeBtn, FontAwesomeBtn},
  emits: {
    closeMe(){return true}
  },
  setup(){
    const colorStore = useColorStore()
    return {colorStore}
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      url: "",
      rules: {
        urlCorrect: (value: string) =>
            (!!value && value.length > 0 && value.startsWith(`${window.location.origin}/join/`) &&
            value.length !== `${window.location.origin}/join/`.length)
            || this.$t('validator.enter_url'),
      }
    }
  },
  computed:
  {
  },
  methods: {
    getColorStore(){
      return this.colorStore;
    },
    closeMe()
    {
      this.url = "";
      this.$emit('closeMe')
    },
    joinGame(){

      if(this.rules.urlCorrect(this.url) === true) {
        let tmp = this.url.replace(window.origin, '')
        this.$router.replace(tmp)
      }

    }
  }
})
</script>

<template>
  <v-dialog
    v-model="visible"
    :persistent="true"
    width="40vw"
  >
    <v-card>
      <v-card-title>
        <v-row>
          <v-col
              cols="10"
          >
            {{ $t('join_game_dialog.title')}}
          </v-col>
          <v-col
              cols="2"
              class="ml-dialog-title-btn-group"
          >
            <font-awesome-btn
                :icon="['fas', 'fa-close']"
                @click="closeMe()"
            />
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-text
        class="ml-dialog-text text-h4"
      >
        <v-text-field
            :hide-details="rules.urlCorrect(url) === true"
            v-model="url"
            :rules="[rules.urlCorrect]"
        />
      </v-card-text>
      <v-card-actions
          class="ml-dialog-actions center"
      >
        <v-font-awesome-btn
          :text="$t('join_game_dialog.join')"
          :icon="['fas', 'fa-house']"
          icon-text-spacing="me-2"
          btn-variant="elevated"
          :btn-color="getColorStore().currentColor.lighten1"
          @click="joinGame()"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>





</template>

<style scoped lang="scss">
@import '@/scss/ml-dialog';

</style>