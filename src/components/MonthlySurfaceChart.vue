<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useTheme } from '../composables/useTheme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  data: {
    type: Object, // { labels: [], values: [] }
    required: true
  }
})

const { isDark } = useTheme()

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: isDark.value ? '#94a3b8' : '#475569',
        usePointStyle: true
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: isDark.value ? '#94a3b8' : '#475569' }
    },
    y: {
      grid: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
      },
      ticks: { color: isDark.value ? '#94a3b8' : '#475569' }
    }
  }
}))

const chartData = computed(() => ({
  labels: props.data.labels,
  datasets: [
    {
      label: 'Surface (ha)',
      borderColor: '#FF9500', // Brand Orange
      backgroundColor: 'rgba(255, 149, 0, 0.2)', // Orange Alpha
      data: props.data.values,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#FF9500'
    }
  ]
}))
</script>

<template>
  <div class="chart-container">
    <Line :data="chartData" :options="options" />
  </div>
</template>

<style scoped>
.chart-container {
  height: 250px;
  width: 100%;
}
</style>
