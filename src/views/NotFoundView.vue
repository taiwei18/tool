<template>
  <ResponsiveLayout>
    <div class="not-found-container">
      <div class="error-content">
        <div class="error-code">404</div>
        <h1 class="error-title">页面未找到</h1>
        <p class="error-description">
          抱歉，您访问的页面不存在或已被删除。
        </p>
        <div class="error-actions">
          <v-btn
            color="primary"
            variant="elevated"
            size="large"
            @click="goHome"
          >
            返回首页
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            @click="goBack"
          >
            返回上一页
          </v-btn>
        </div>
      </div>
      <div class="error-illustration">
        <v-icon
          icon="mdi-compass-off-outline"
          size="200"
          color="grey-lighten-1"
        />
      </div>
    </div>
  </ResponsiveLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ResponsiveLayout from '@/components/ResponsiveLayout.vue'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'home' })
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.error-content {
  max-width: 500px;
  margin-bottom: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  color: #1F2937;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.error-description {
  font-size: 1.1rem;
  color: #6B7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-illustration {
  opacity: 0.5;
}

@media (max-width: 640px) {
  .error-code {
    font-size: 6rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .error-actions .v-btn {
    width: 200px;
  }
}
</style>
