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
  data: Object
})

const { isDark } = useTheme()

const chartData = computed(() => ({
  labels: props.data?.labels || [],
  datasets: [
    {
      label: 'Forte Sévérité',
      backgroundColor: isDark.value ? '#F87171' : '#EF4444', // Red Vivid (was Pink)
      data: props.data?.high || [],
      borderRadius: 4,
      barThickness: 20
    },
    {
      label: 'Sévérité Moyenne',
      backgroundColor: '#EAB308', // Yellow/Orange
      data: props.data?.medium || [],
      borderRadius: 4,
      barThickness: 20
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      stacked: true, // Stack bars
      beginAtZero: true,
      grid: {
        color: isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        drawBorder: false
      },
      ticks: {
        color: isDark.value ? '#A3A3A3' : '#525252'
      }
    },
    x: {
      stacked: true, // Stack bars
      grid: {
        display: false
      },
      ticks: {
        color: isDark.value ? '#A3A3A3' : '#525252'
      }
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: isDark.value ? '#A3A3A3' : '#525252',
        usePointStyle: true
      }
    },
    tooltip: {
       mode: 'index',
       intersect: false,
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
