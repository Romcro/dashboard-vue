<template>
  <div class="chart-container">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { useTheme } from '../composables/useTheme'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  high: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  low: { type: Number, default: 0 } // Added for completeness if needed
})

const { isDark } = useTheme()

const chartData = computed(() => ({
  labels: ['Forte', 'Moyenne'], // Adding 'Faible' if we had it
  datasets: [{
    backgroundColor: [
       // Red (Critical)
       isDark.value ? '#FF6B9D' : '#EF4444',
       // Orange (Warning)
       isDark.value ? '#FF9500' : '#F97316'
    ],
    borderWidth: 0,
    hoverOffset: 10,
    data: [props.high, props.medium]
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: isDark.value ? '#A3A3A3' : '#525252',
        font: {
          family: 'Inter',
          size: 12
        },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: isDark.value ? '#262626' : '#FFFFFF',
      titleColor: isDark.value ? '#FFFFFF' : '#1a1a1a',
      bodyColor: isDark.value ? '#A3A3A3' : '#525252',
      borderColor: isDark.value ? '#404040' : '#E5E7EB',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: {
          label: (ctx) => {
              const val = ctx.raw
              const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) + '%' : '0%'
              return ` ${ctx.label}: ${val} (${pct})`
          }
      }
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
