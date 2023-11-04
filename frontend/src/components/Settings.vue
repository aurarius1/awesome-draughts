<script lang="ts">
import colors from 'vuetify/lib/util/colors'
import ColorSwatch from "@/components/ColorSelector/ColorSwatch.vue";
import ColorSelector from "@/components/ColorSelector/ColorSelector.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

import {useColorStore, useLanguageStore} from "@/store";
import {useTheme} from "vuetify";

export default defineComponent({
  name: "Settings",
  components: {
    FontAwesomeIcon,
    ColorSelector,
    ColorSwatch
  },
  emits: {
    closeSettings(){

    }
  },
  setup()
  {
    const colorStore = useColorStore()
    const languageStore = useLanguageStore()
    const themeStore = useThemeStore()
    const vuetifyTheme = useTheme()

    return {colorStore, languageStore, themeStore, vuetifyTheme}
  },
  watch: {
    selectedLanguage(newVal: string){
      this.getLanguageStore().changeLanguage(newVal);
    }
  },
  data(){
    return{
      selected: this.getColorStore().currentColor.base,
      selectedLanguage: this.getLanguageStore().currentLanguage,
      palette: [
        [
          colors.red.base,
          colors.pink.base,
          colors.purple.base,
          colors.deepPurple.base,
        ],
        [
          colors.indigo.base,
          colors.blue.base,
          colors.lightBlue.base,
          colors.cyan.base,
        ],
        [
          colors.teal.base,
          colors.green.base,
          colors.lightGreen.base,
          colors.lime.base,
        ],
        [
          colors.yellow.base,
          colors.amber.base,
          colors.orange.base,
          colors.deepOrange.base,
        ]
      ],
    }
  },
  methods: {
    updateColor(newColor: string)
    {
      this.selected = newColor;
      let keys = Object.keys(colors)
      for(let i = 0; i < keys.length; i++)
      {
        if(colors[keys[i]].base === this.selected)
        {
          this.getColorStore().changeColor(colors[keys[i]])
          break;
        }
      }
    },
    getIconColor()
    {
      return {
        color: this.getColorStore().currentColor.lighten1
      }
    },
    changeTheme()
    {
      this.getThemeStore().changeTheme(this.getThemeStore().currentTheme === 'light' ? 'dark' : 'light');
      this.getVuetifyTheme().global.name.value = this.getThemeStore().currentTheme;
    },
    getLanguageStore()
    {
      return this.languageStore
    },
    getColorStore()
    {
      return this.colorStore
    },
    getVuetifyTheme()
    {
      return this.vuetifyTheme
    },
    getThemeStore()
    {
      return this.themeStore
    },
    leaveSettings()
    {
      if(this.inGame)
      {
        this.$emit('closeSettings')
      }
      else
      {
        this.$router.push('/')
      }
    }
  },
  props: {
    colSize: {
      type: String,
      default: "4"
    },
    inGame: {
      type: Boolean,
      default: false,
    }
  }
})
</script>

<template>
  <v-container
  >
    <v-row
      justify="center"
    >
      <v-col
        :cols="colSize"
      >
        <v-card>
          <v-card-text>
            <div
                class="ml-selection-card"
            >
              <p
                  class="text-h6 ml-description"
              >
                {{ $t('select_color')}}
              </p>

              <color-selector
                  :selected-color="selected"
                  :colors="palette"
                  @color-selected="updateColor"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row
        justify="center"
    >
      <v-col
          :cols="colSize"
      >
        <v-card>
          <v-card-text>
            <div
                class="ml-selection-card"
            >
              <p
                  class="text-h6 ml-description"
              >
                {{ $t('select_theme')}}
              </p>

              <font-awesome-icon
                  :icon="getThemeStore().currentTheme === 'light' ? ['far', 'sun'] : ['fas', 'sun']"
                  size="2x"
                  :style="getIconColor()"
                  class="ml-theme-selector"
                  @click="changeTheme()"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row
        justify="center"
    >
      <v-col
          :cols="colSize"
      >
        <v-card>
          <v-card-title>
            <font-awesome-icon
                :icon="['fas', 'language']"
                :style="getIconColor()"
            />
            {{ $t('select_language')}}
          </v-card-title>
          <v-card-text>
            <div
                class="ml-selection-card"
            >
              <v-select
                  density="compact"
                  :items="$i18n.availableLocales"
                  :color="getColorStore().currentColor.base"
                  v-model="selectedLanguage"
              >
                <template v-slot:item="{props, item}">
                  <v-list-item v-bind="props"
                    :title="$t(`language.${item.title}`)"
                  >
                  </v-list-item>
                </template>
                <template v-slot:selection="{ item}">
                  <span

                  >
                    {{$t(`language.${item.title}`)}}
                  </span>
                </template>
              </v-select>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row
        justify="center"
    >
      <v-col
          :cols="colSize"
          class="ml-exit-btn"
      >
        <v-btn
          :color="getColorStore().currentColor.accent1"
          @click="leaveSettings()"
        >
          {{ $t("exit_settings") }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">

.ml-selection-card{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ml-description {
  display: flex;
  align-items: center;
}

.ml-exit-btn{
  display: flex;
  justify-content: center;
}

.ml-theme-selector{
  width: 40px;
  height: 40px;


  &:hover{
    cursor: pointer;
  }
}
</style>