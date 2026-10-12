<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const props = defineProps({
  forestName: String,
  currentStart: Date,
  currentEnd: Date,
  previousStart: Date,
  previousEnd: Date
})

const formatDate = (date) => date ? format(date, 'dd/MM/yyyy') : '-'
const todayDate = format(new Date(), 'dd/MM/yyyy')
</script>

<template>
  <div class="banner">
    <div class="banner-content">
      <div class="text-content">
        <h1>{{ forestName }}</h1>
        <p class="greeting">Bonjour et bienvenue</p>
        <p class="date">Nous sommes le {{ todayDate }}</p>
      </div>
      
      <div class="weather-widgets">
        <div class="widget widget-current">
          <label>ANALYSE EN COURS</label>
          <div class="value">{{ formatDate(currentStart) }} - {{ formatDate(currentEnd) }}</div>
        </div>
        
        <div class="widget widget-previous">
          <label>ANALYSE PRÉCÉDENTE</label>
          <div class="value">{{ formatDate(previousStart) }} - {{ formatDate(previousEnd) }}</div>
        </div>

        <div class="widget widget-weather">
          <label>MÉTÉO MOYENNE</label>
          <div class="value">Cloudy · 13°C</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.banner {
  background: linear-gradient(135deg, rgba(12, 13, 13, 0.7) 0%, rgba(12, 13, 13, 0.5) 100%), radial-gradient(120% 140% at 85% 0%, #2f6b3f 0%, #17241b 60%);
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.banner-content {
  padding: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.text-content h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.greeting {
  font-size: 1.25rem;
  color: rgba(255,255,255,0.9);
  font-weight: 500;
}

.date {
  color: rgba(255,255,255,0.7);
}

.weather-widgets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 300px;
}

.widget {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(5px);
}

.widget-current {
  background: rgba(50, 213, 131, 0.1);
  border-color: rgba(50, 213, 131, 0.3);
}

.widget-previous {
  background: rgba(183, 240, 106, 0.1);
  border-color: rgba(183, 240, 106, 0.3);
}

.widget label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.25rem;
}

.widget-current label { color: var(--color-accent-cyan); }
.widget-previous label { color: var(--color-primary); }
.widget-weather label { color: var(--color-text-muted); }

.widget .value {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}
</style>
