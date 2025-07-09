<script setup lang="ts">
interface Props {
  title: string
  description?: string
  color?: string
}

withDefaults(defineProps<Props>(), {
  description: '',
  color: 'primary'
})
</script>

<template>
  <v-card
    class="demo-card"
    :class="[
      'hover:shadow-lg transition-all duration-300',
      'border-l-4 border-primary'
    ]"
    elevation="2"
  >
    <v-card-title 
      :class="[
        'text-primary font-bold',
        'flex-center gap-2'
      ]"
    >
      <v-icon :color="color">mdi-card-text</v-icon>
      {{ title }}
    </v-card-title>
    
    <v-card-text 
      v-if="description"
      class="text-gray-600 leading-relaxed"
    >
      {{ description }}
    </v-card-text>
    
    <v-card-actions class="px-4 pb-4">
      <v-spacer />
      <v-btn
        :color="color"
        variant="text"
        size="small"
        class="text-none"
      >
        了解更多
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.demo-card {
  /* UnoCSS 和 Vuetify 样式结合示例 */
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
}

.demo-card:hover {
  transform: translateY(-2px);
}
</style>
