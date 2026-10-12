<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import { computed } from 'vue'

// Register all ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement)

const props = defineProps({
  type: {
    type: String,
    default: 'bar' // bar, line, doughnut
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

// Dynamic component selection based on type
const chartComponent = computed(() => {
  switch (props.type) {
    case 'line': return Line
    case 'doughnut': return Doughnut
    default: return Bar
  }
})

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'var(--color-text-muted)' // This allows CSS var usage but ChartJS needs helper to parse it usually.
                                         // For now, simpler to leave default or bind to style.
      }
    }
  }
}
</script>

<template>
  <div class="chart-container">
    <component :is="chartComponent" :data="data" :options="{ ...defaultOptions, ...options }" />
  </div>
</template>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
