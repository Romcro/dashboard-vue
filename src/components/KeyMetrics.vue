<template>
  <div class="kpi-card glass-panel">
    <div class="kpi-label">{{ label }}</div>
    
    <div class="kpi-value-container">
        <span class="kpi-value" :class="{ 'critical': isCritical }">{{ value }}</span>
        <span v-if="unit" class="kpi-unit">{{ unit }}</span>
    </div>

    <div v-if="trend !== undefined && trend !== null" class="kpi-trend" :class="trendClass">
      <span class="trend-icon" v-if="trend > 0">↑</span>
      <span class="trend-icon" v-if="trend < 0">↓</span>
      {{ formatTrend(trend) }} {{ trendLabel }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: [Number, String],
  unit: String,
  trend: Number,
  trendLabel: { type: String, default: '' },
  isCritical: Boolean
})

const trendClass = computed(() => {
    if (!props.trend) return 'neutral'
    // For alerts/surface, UP is BAD (usually), but let's stick to Green=Down (Good) for defects, Red=Up
    // Context dependent. Assuming "Alerts": Up = Bad (Red), Down = Good (Green)
    return props.trend > 0 ? 'negative' : 'positive'
})

const formatTrend = (t) => {
    return t > 0 ? `+${t}` : `${t}`
}
</script>

<style scoped>
.kpi-card {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center horizontally */
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
  height: 100%;
}

.kpi-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.kpi-value-container {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.kpi-value {
  font-size: 3rem; /* BIG numbers */
  font-weight: 700;
  color: var(--color-text-main);
  line-height: 1;
}

.kpi-value.critical {
  color: var(--color-text-main); /* Keep white, maybe add glowing text shadow if needed, but clean is better */
}

.kpi-unit {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.kpi-trend {
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
}

.kpi-trend.positive {
  color: var(--color-status-normal); /* Green */
}

.kpi-trend.negative {
  color: var(--color-status-critical); /* Red */
}
</style>
