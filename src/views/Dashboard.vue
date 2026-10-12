<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import BannerWeather from '../components/BannerWeather.vue'
import KeyMetrics from '../components/KeyMetrics.vue'
import AlertsTable from '../components/AlertsTable.vue'
import MonthlyEventsChart from '../components/MonthlyEventsChart.vue'
import SeverityDoughnut from '../components/SeverityDoughnut.vue' // Replaced Pie
import MonthlySurfaceChart from '../components/MonthlySurfaceChart.vue'
import ForestDetailsTable from '../components/ForestDetailsTable.vue'
import TopForestsChart from '../components/TopForestsChart.vue' 
import TopParcelsChart from '../components/TopParcelsChart.vue' // NEW
import SpeciesChart from '../components/SpeciesChart.vue'
import ThemeToggle from '../components/ThemeToggle.vue'
import api from '../services/api'
import { useDashboardState } from '../composables/useDashboardState'
import { useTheme } from '../composables/useTheme'
import { calculatePeriodDates } from '../utils/dateUtils'
import { format, isWithinInterval, isSameMonth, subMonths, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'

// --- State ---
const { selectedForest, setSelectedForest, forests } = useDashboardState()

// const forests = ref([]) // Removed local ref
const plots = ref([])
const events = ref([])
const species = ref([])
const isLoading = ref(true)

// --- Date Periods ---
// --- Date Periods (Overridden for 12 Months Rolling) ---
// const { currentStart, currentEnd, previousStart, previousEnd } = calculatePeriodDates()

// Force 12 Months Rolling
const currentEnd = new Date()
const currentStart = subMonths(currentEnd, 12)
const previousEnd = subMonths(currentEnd, 12)
const previousStart = subMonths(currentEnd, 24)

// --- Data Fetching ---
onMounted(async () => {
  try {
    const [plotsRes, eventsRes, speciesRes] = await Promise.all([
     // api.fetchForests(), // Managed globally now
      api.fetchPlots(),
      api.fetchEvents(),
      api.fetchSpecies()
    ])
    
    // Parse response data safely
    plots.value = Array.isArray(plotsRes.data) ? plotsRes.data : (plotsRes.data.data || [])
    events.value = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.data || [])
    species.value = Array.isArray(speciesRes.data) ? speciesRes.data : (speciesRes.data.data || [])

    if (events.value.length > 0) {
        console.log("DEBUG: Raw Event Sample:", events.value[0])
        console.log("DEBUG: Event fields:", Object.keys(events.value[0]))
        console.log("DEBUG: Severity check:", events.value.slice(0, 5).map(e => ({ s: e.severity, sc: e.score, d: e.confirmationDate || e.createdAt })))
    }

    console.log("Loaded Dashboard Data Config:", { 
      plots: plots.value.length, 
      events: events.value.length,
      species: species.value.length,
      periodStart: currentStart,
      periodEnd: currentEnd
    })
    
  } catch (e) {
    console.error("Failed to load data", e)
  } finally {
    isLoading.value = false
  }
})

// --- Computed / Filtering ---

// Active Forest
const activeForest = computed(() => {
  if (!selectedForest.value) return null
  return forests.value.find(f => String(f.id) === String(selectedForest.value))
})

// Filtered Plots (by Forest)
const filteredPlots = computed(() => {
  if (!selectedForest.value) return plots.value
  return plots.value.filter(p => {
    const fId = p.forestId !== undefined ? p.forestId : p.forest_id
    return String(fId) === String(selectedForest.value)
  })
})

// Plot IDs helpers
const filteredPlotIds = computed(() => filteredPlots.value.map(p => p.id))

// Filtered Events (by Forest aka Plot)
const eventsInForest = computed(() => {
  return events.value.filter(e => {
    const pId = e.plotId !== undefined ? e.plotId : e.plot_id
    return filteredPlotIds.value.includes(pId)
  })
})

// --- Period Filtering Logic ---
const getEventDate = (event) => {
  // Priority: confirmationDate -> createdAt
  if (event.confirmationDate) return parseISO(event.confirmationDate)
  if (event.createdAt) return parseISO(event.createdAt)
  return null
}

const eventsCurrentPeriod = computed(() => {
  return eventsInForest.value.filter(e => {
    const date = getEventDate(e)
    return date && isWithinInterval(date, { start: currentStart, end: currentEnd })
  })
})

const eventsPreviousPeriod = computed(() => {
  return eventsInForest.value.filter(e => {
    const date = getEventDate(e)
    return date && isWithinInterval(date, { start: previousStart, end: previousEnd })
  })
})

// --- KPIS ---

// 1. Alertes Détectées
const alertsCountCurrent = computed(() => eventsCurrentPeriod.value.length)
const alertsCountPrevious = computed(() => eventsPreviousPeriod.value.length)
const alertsTrend = computed(() => alertsCountCurrent.value - alertsCountPrevious.value)

// 2. Surface Impactée (Sum area of current alerts)
const impactedSurfaceCurrent = computed(() => {
  const areaM2 = eventsCurrentPeriod.value.reduce((sum, e) => sum + (e.area || 0), 0)
  return (areaM2 / 10000) // ha
})
const impactedSurfacePrevious = computed(() => {
  const areaM2 = eventsPreviousPeriod.value.reduce((sum, e) => sum + (e.area || 0), 0)
  return (areaM2 / 10000) // ha
})
const surfaceTrend = computed(() => Math.round((impactedSurfaceCurrent.value - impactedSurfacePrevious.value) * 100) / 100)

// 3. Alertes Traitées (Status 'Archived' in current period)
const treatedAlertsCount = computed(() => {
  return eventsCurrentPeriod.value.filter(e => (e.status || '').toLowerCase() === 'archived').length
})

// 4. Surface Surveillée (Total Forest Area)
const monitoredSurface = computed(() => {
  if (activeForest.value) {
    return (activeForest.value.area || 0) / 10000
  }
  return forests.value.reduce((sum, f) => sum + (f.area || 0), 0) / 10000
})

const plotsCount = computed(() => filteredPlots.value.length)

// --- 3. Sévérité & Parcelles ---
const getSeverity = (event) => {
  // Priority 1: Numeric Score
  if (typeof event.score === 'number') {
    return event.score > 0.5 ? 'high' : 'medium'
  }
  
  // Priority 2: String matching (robust)
  const s = String(event.severity || '').toLowerCase()
  if (s.includes('high') || s.includes('fort') || s.includes('élevée') || s.includes('critical')) {
    return 'high'
  }
  
  return 'medium'
}

const highSeverityCount = computed(() => {
  return eventsCurrentPeriod.value.filter(e => getSeverity(e) === 'high').length
})

const highSeverityPrevious = computed(() => {
    return eventsPreviousPeriod.value.filter(e => getSeverity(e) === 'high').length
})

const highSeverityTrendPercent = computed(() => {
    const current = highSeverityCount.value
    const previous = highSeverityPrevious.value
    
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
})

const impactedPlotsCount = computed(() => {
  const plots = new Set(eventsCurrentPeriod.value.map(e => e.plotId))
  return plots.size
})

const impactedPlotsPrevious = computed(() => {
    const plots = new Set(eventsPreviousPeriod.value.map(e => e.plotId))
    return plots.size
})

const impactedPlotsTrendPercent = computed(() => {
    const current = impactedPlotsCount.value
    const previous = impactedPlotsPrevious.value
    
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
})

// --- Charts Data Preparation ---
// --- Charts Data Preparation ---

const last12Months = computed(() => {
  const months = []
  for (let i = 11; i >= 0; i--) {
    months.push(subMonths(new Date(), i))
  }
  return months
})

const monthlyEventsData = computed(() => {
  const labels = last12Months.value.map(d => format(d, 'MMM yyyy', { locale: fr }))
  const high = []
  const medium = []

  last12Months.value.forEach(monthDate => {
    // Filter events in this month (from ALL events in forest, not just current period, to show trend)
    const monthEvents = eventsInForest.value.filter(e => {
        const d = getEventDate(e)
        return d && isSameMonth(d, monthDate)
    })
    
    high.push(monthEvents.filter(e => getSeverity(e) === 'high').length)
    medium.push(monthEvents.filter(e => getSeverity(e) === 'medium').length)
  })

  return { labels, high, medium }
})

const severityDistribution = computed(() => {
  const high = eventsCurrentPeriod.value.filter(e => getSeverity(e) === 'high').length
  const medium = eventsCurrentPeriod.value.filter(e => getSeverity(e) === 'medium').length
  return { high, medium }
})

const monthlySurfaceData = computed(() => {
  const labels = last12Months.value.map(d => format(d, 'MMM yyyy', { locale: fr }))
  const values = []

  last12Months.value.forEach(monthDate => {
    const monthEvents = eventsInForest.value.filter(e => {
      const d = getEventDate(e)
      return d && isSameMonth(d, monthDate)
    })
    const area = monthEvents.reduce((sum, e) => sum + (e.area || 0), 0) / 10000 // ha
    values.push(area)
  })

  return { labels, values }
})

// --- Table Data ---
const forestTableData = computed(() => {
  // If a forest is selected, just show that one in the table (or we could show plots if we had plot names?)
  const targetForests = activeForest.value ? [activeForest.value] : forests.value
  
  return targetForests.map(f => {
    // Events for this forest in current period
    const fPlots = plots.value.filter(p => {
        const fId = p.forestId !== undefined ? p.forestId : p.forest_id
        return String(fId) === String(f.id)
    }).map(p => p.id)

    const fEvents = events.value.filter(e => {
        const pId = e.plotId !== undefined ? e.plotId : e.plot_id
        return fPlots.includes(pId) && 
        isWithinInterval(getEventDate(e), { start: currentStart, end: currentEnd })
    })
    
    const high = fEvents.filter(e => getSeverity(e) === 'high').length
    const area = fEvents.reduce((sum, e) => sum + (e.area || 0), 0) / 10000
    
    return {
      name: f.name,
      events: fEvents.length,
      surface: area,
      highSeverityCount: high,
      mediumSeverityCount: fEvents.length - high
    }
  })
})

// --- Top Forests Data ---
const topForestsData = computed(() => {
    // Sort table data by events count desc, take top 5
    const sorted = [...forestTableData.value].sort((a,b) => b.events - a.events).slice(0, 5)
    return {
        labels: sorted.map(f => f.name),
        values: sorted.map(f => f.events)
    }
})

// --- Species Data Logic ---
const forestSpeciesData = computed(() => {
  // Logic from python: iterate plots in forest, count species appearances
  const countMap = {}
  
  // Species map: id -> name
  const speciesMap = {}
  species.value.forEach(s => {
    speciesMap[s.id] = s.name_fr || s.name || `Species ${s.id}`
  })
  
  filteredPlots.value.forEach(plot => {
    if (plot.species && Array.isArray(plot.species)) {
       plot.species.forEach(sp => {
         const spId = (typeof sp === 'object') ? sp.id : sp
         const spName = speciesMap[spId] || `Species ${spId}`
         countMap[spName] = (countMap[spName] || 0) + 1
       })
    }
  })
  
  // Convert to array
  return Object.keys(countMap).map(name => ({
    name,
    count: countMap[name]
  })).sort((a,b) => b.count - a.count)
})

// --- Sorted Alerts (Contextual) ---
const sortedAlerts = computed(() => {
    // 1. Filter eventsCurrentPeriod (already filtered by forest & date)
    let alerts = [...eventsCurrentPeriod.value]
    
    // 2. Map to format needed by AlertsTable (if needed) and add forestName/plotId
    alerts = alerts.map(e => ({
        ...e,
        forestName: activeForest.value?.name || 'Unknown',
        plotId: e.plotId || e.plot_id,
        severity: getSeverity(e).toUpperCase(), // AlertsTable expects uppercase or string
        score: e.score,
        area: (e.area / 10000).toFixed(2), // Convert to ha for display
        confirmationDate: e.confirmationDate || e.createdAt,
        status: e.status || 'Active'
    }))

    // 3. Sort: High Severity first, then Area Descending
    return alerts.sort((a, b) => {
        // Severity Score (if available) or Level
        const sevA = a.severity === 'HIGH' ? 2 : 1
        const sevB = b.severity === 'HIGH' ? 2 : 1
        
        if (sevA !== sevB) return sevB - sevA // High first
        
        // Then Size (Area)
        return parseFloat(b.area) - parseFloat(a.area)
    })
})

// --- Top Parcels Data (Contextual) ---
const topParcelsData = computed(() => {
    const parcelCounts = {}
    
    eventsCurrentPeriod.value.forEach(e => {
        const pId = e.plotId || e.plot_id
        parcelCounts[pId] = (parcelCounts[pId] || 0) + 1
    })

    const sortedParcels = Object.keys(parcelCounts)
        .map(pId => ({ id: pId, count: parcelCounts[pId] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return {
        labels: sortedParcels.map(p => `Parcelle ${p.id}`), // Simple label
        values: sortedParcels.map(p => p.count)
    }
})

// --- Actions ---
const selectForest = (id) => {
  setSelectedForest(id === 'all' ? null : id)
}

// --- Theme / Logo ---
const { isDark } = useTheme()
</script>

<template>
    <main class="dashboard-content">
      
      <!-- Custom Banner passing real dates -->
      <BannerWeather 
        :forestName="activeForest?.name || 'VUE D\'ENSEMBLE'"
        :currentStart="currentStart"
        :currentEnd="currentEnd"
        :previousStart="previousStart"
        :previousEnd="previousEnd"
      />

      <!-- KPI Grid -->
      <div class="kpi-grid">
        <KeyMetrics 
          label="Alertes détectées 🔔" 
          :value="alertsCountCurrent" 
          :trend="alertsTrend" 
          trendLabel="vs p.p." 
          isCritical
        />
        <KeyMetrics 
          label="Surface impactée ⛰️" 
          :value="(impactedSurfaceCurrent || 0).toFixed(2)" 
          unit="ha" 
          :trend="surfaceTrend"
          :trendLabel="surfaceTrend === 0 ? '' : 'ha vs p.p.'"
        />
        <KeyMetrics 
          label="Forte Sévérité 🚨" 
          :value="highSeverityCount" 
          :trend="highSeverityTrendPercent"
          trendLabel="% sur 12 mois"
          isCritical
        />
         <KeyMetrics 
          label="Parcelles Touchées 📍" 
          :value="impactedPlotsCount" 
          :trend="impactedPlotsTrendPercent"
          trendLabel="% sur 12 mois"
        />
      </div>

      <!-- ROW 2: Charts (Trends & Distribution) -->
      <div class="grid-row-charts">
        <!-- Monthly Events Trend (Line) -->
        <div class="chart-card glass-panel wide-chart">
          <h3>Nombre de dépérissements par mois</h3>
          <p class="subtitle">Distribution mensuelle des événements</p>
          <MonthlyEventsChart :data="monthlyEventsData" />
        </div>
        
        <!-- Severity Doughnut -->
        <div class="chart-card glass-panel narrow-chart">
          <h3>Répartition par sévérité</h3>
          <p class="subtitle">Anomalies détectées</p>
          <SeverityDoughnut 
            :high="severityDistribution.high" 
            :medium="severityDistribution.medium" 
          />
        </div>
      </div>

      <!-- ROW 3: Monthly Surface & Species -->
      <div class="grid-row-charts">
         <!-- Monthly Surface Chart -->
         <div class="chart-card glass-panel wide-chart">
            <h3>Surface affectée par mois (ha)</h3>
            <p class="subtitle">Évolution de la surface forestière touchée</p>
            <MonthlySurfaceChart :data="monthlySurfaceData" />
         </div>

         <!-- Species Polar Chart -->
         <div v-if="forestSpeciesData.length > 0" class="chart-card glass-panel narrow-chart">
            <h3>Répartition Espèces</h3>
            <p class="subtitle">Essences présentes dans les parcelles</p>
            <SpeciesChart :species="forestSpeciesData" />
         </div>
      </div>

      <!-- ROW 4: Details (Forest List OR Alerts List & Top items) -->
      <div class="grid-row-data">
        
        <!-- CASE 1: GLOBAL VIEW (No forest selected) -->
        <template v-if="!selectedForest">
            <!-- Forest List (Table) -->
            <div class="glass-panel table-panel wide-chart">
                <ForestDetailsTable :rows="forestTableData" />
            </div>

            <!-- Top Forests (Bar Chart) -->
            <div class="chart-card glass-panel narrow-chart">
                <h3>Forêts les plus touchées</h3>
                <p class="subtitle">Top 5 par nombre d'événements</p>
                <TopForestsChart 
                    :labels="topForestsData.labels" 
                    :values="topForestsData.values" 
                />
            </div>
        </template>

        <!-- CASE 2: FOREST SELECTED VIEW -->
        <template v-else>
             <!-- Alerts List (Sorted by Severity & Area) -->
             <!-- Added inline flex style to manage height correctly -->
            <div class="glass-panel table-panel wide-chart" style="display: flex; flex-direction: column;">
                <h3>Alertes en cours</h3>
                <p class="subtitle">Triées par sévérité et surface</p>
                
                 <div style="flex: 1; min-height: 0; overflow: hidden;">
                    <AlertsTable :alerts="sortedAlerts" />
                 </div>
            </div>

            <!-- Top Parcels (Bar Chart) -->
            <div class="chart-card glass-panel narrow-chart">
                <h3>Parcelles les plus touchées</h3>
                <p class="subtitle">Top 5 - Zones critiques</p>
                <div style="flex: 1; min-height: 0; position: relative;">
                    <TopParcelsChart 
                        :labels="topParcelsData.labels" 
                        :values="topParcelsData.values"
                    />
                </div>
            </div>
        </template>
      </div>

    </main>

</template>
<style scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.grid-row-charts, .grid-row-data {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.wide-chart {
    flex: 2; /* Takes 2/3 space */
    min-width: 500px;
}

.narrow-chart {
    flex: 1; /* Takes 1/3 space */
    min-width: 300px;
}

/* Responsiveness */
@media (max-width: 1024px) {
    .wide-chart, .narrow-chart {
        flex: 100%; /* Stack on smaller screens */
        min-width: 100%;
    }
}

.subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: -0.25rem;
  margin-bottom: 1rem;
}

.table-panel {
    padding: 1.5rem;
    height: 500px; /* Fixed height for scrolling table inside */
}

.chart-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 350px;
  justify-content: flex-start;
}

h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
}
</style>
