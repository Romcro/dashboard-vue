<script setup>
import { onMounted } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme, initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<template>
  <button 
    class="theme-toggle" 
    @click="toggleTheme" 
    :aria-label="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
  >
    <div class="toggle-track" :class="{ 'track-dark': isDark }">
      <div class="toggle-thumb">
        <span class="icon" v-if="isDark">🌙</span>
        <span class="icon" v-else>☀️</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-track {
  width: 50px;
  height: 26px;
  background-color: #cbd5e1; /* Slate 300 for Light Mode */
  border-radius: 13px;
  position: relative;
  transition: background-color 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.toggle-track.track-dark {
  background-color: var(--color-brand-yellow); /* Neon Yellow active state */
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.track-dark .toggle-thumb {
  transform: translateX(24px);
}

.icon {
  font-size: 12px;
  line-height: 1;
  user-select: none;
}
</style>
