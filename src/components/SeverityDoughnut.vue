<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { useTheme } from '../composables/useTheme'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  high: { type: Number, default: 0 },
  medium: { type: Number, default: 0 }
})

const { isDark } = useTheme()

const total = computed(() => props.high + props.medium)

const highPercent = computed(() => total.value === 0 ? 0 : Math.round((props.high / total.value) * 100))
const mediumPercent = computed(() => total.value === 0 ? 0 : Math.round((props.medium / total.value) * 100))

// Colors
const highColor = computed(() => isDark.value ? '#F87171' : '#EF4444') // Red
const mediumColor = computed(() => '#FF9500') // Orange
const trackColor = computed(() => isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')

const chartData = computed(() => ({
  labels: ['Forte', 'Moyenne'],
  datasets: [
    // Outer Ring: High
    {
      backgroundColor: [highColor.value, trackColor.value],
      borderWidth: 0,
      data: [props.high, props.medium], // High vs Rest (Medium is the rest)
      borderRadius: 20, // Rounded ends
    },
    // Spacer Ring (Invisible)
    {
        backgroundColor: ['transparent'],
        borderWidth: 0,
        data: [1],
        weight: 0.4, // Controls the gap size
    },
    // Inner Ring: Medium
    {
      backgroundColor: [mediumColor.value, trackColor.value],
      borderWidth: 0,
      data: [props.medium, props.high], // Medium vs Rest
      borderRadius: 20,
    }
  ]
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '50%', // Size of hole
  radius: '90%',
  plugins: {
    legend: { display: false }, // Custom legend
    tooltip: { enabled: false } // No tooltips for clean UI
  },
  animation: {
      animateScale: true,
      animateRotate: true
  }
}))
</script>

<template>
  <div class="chart-wrapper">
      <!-- Chart Side -->
      <div class="chart-container">
        <Doughnut :data="chartData" :options="options" />
      </div>
      
      <!-- Legend Side -->
      <div class="custom-legend">
          <div class="legend-item">
              <span class="legend-percent" :style="{ color: highColor }">{{ highPercent }}%</span>
              <span class="legend-label">Forte</span>
              <!-- Visual Indicator Line could go here if needed -->
          </div>
          <div class="legend-item">
              <span class="legend-percent" :style="{ color: mediumColor }">{{ mediumPercent }}%</span>
              <span class="legend-label">Moyenne</span>
          </div>
      </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
    position: relative;
    height: 300px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.chart-container {
  height: 200px; /* Constrain chart size to keep rings sharp */
  width: 200px;
  flex-shrink: 0;
}

.custom-legend {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    justify-content: center;
}

.legend-item {
    display: flex;
    flex-direction: column;
    border-left: 3px solid transparent; /* Just for spacing alignment */
}

.legend-percent {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
}

.legend-label {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    font-weight: 500;
}
</style>
