<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { PolarArea } from 'vue-chartjs'
import { useTheme } from '../composables/useTheme'

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend)

const props = defineProps({
  species: {
    type: Array, // Expected: [{ name: 'Oak', count: 10 }, ...]
    required: true
  }
})

const { isDark } = useTheme()

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#94a3b8',
        font: { size: 11 }
      }
    }
  },
  scales: {
    r: {
      grid: { color: 'rgba(50, 213, 131, 0.2)' },
      ticks: { display: false, backdropColor: 'transparent' },
      pointLabels: { color: '#e2e8f0', font: { size: 12 } }
    }
  }
}

const data = computed(() => {
  return {
    labels: props.species.map(s => s.name),
    datasets: [
      {
        backgroundColor: [
          'rgba(50, 213, 131, 0.7)', // Cyan #32D583
          'rgba(183, 240, 106, 0.7)',  // Lime #B7F06A
          isDark && isDark.value ? '#F87171' : '#EF4444', // Red Vivid
          'rgba(255, 107, 157, 0.7)', // Brand Pink / Coral (Restored)
          'rgba(255, 149, 0, 0.7)',   // Brand Orange #FF9500
          'rgba(124, 253, 234, 0.7)'  // Cyan Light #7CFDEA
        ],
        borderColor: 'transparent',
        borderWidth: 0,
        data: props.species.map(s => s.count)
      }
    ]
  }
})
</script>

<template>
  <div class="chart-container">
    <PolarArea :data="data" :options="options" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 300px;
  width: 100%;
}
</style>
