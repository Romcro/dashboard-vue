<template>
  <div class="chart-container">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../composables/useTheme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] }
})

const { isDark } = useTheme()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [{
    label: 'Événements',
    backgroundColor: '#EF4444', // Red for severity emphasis
    borderRadius: 4,
    barThickness: 20,
    data: props.values
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Horizontal Bar
  scales: {
    x: {
      beginAtZero: true,
      grid: {
         color: isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
         color: isDark.value ? '#A3A3A3' : '#525252'
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
         color: isDark.value ? '#FFFFFF' : '#1a1a1a',
         font: {
             weight: 600
         }
      }
    }
  },
  plugins: {
    legend: {
      display: false 
    },
    tooltip: {
      backgroundColor: isDark.value ? '#262626' : '#FFFFFF',
      titleColor: isDark.value ? '#FFFFFF' : '#1a1a1a',
      bodyColor: isDark.value ? '#A3A3A3' : '#525252',
      borderColor: isDark.value ? '#404040' : '#E5E7EB',
      borderWidth: 1
    }
  }
}))
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 100%;
  width: 100%;
  min-height: 250px;
}
</style>
