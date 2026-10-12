<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import ForestMap from '../components/ForestMap.vue'

import api from '../services/api'
import { useDashboardState } from '../composables/useDashboardState'
import { calculatePeriodDates } from '../utils/dateUtils'
import { isWithinInterval, parseISO, subMonths } from 'date-fns'

// --- State ---
const { selectedForest, setSelectedForest, forests } = useDashboardState()
const isLoading = ref(true)

// const forests = ref([]) // Managed globally
const plots = ref([])
const events = ref([])

// --- Filters State ---
const selectedPlot = ref('all')
const selectedSeverity = ref('all')
const selectedStatus = ref('all')
const surfaceRange = ref([0, 100])
const maxSurface = ref(100)
const is3D = ref(false)

// Reset 3D view when forest changes (User Request)
watch(selectedForest, () => {
    is3D.value = false
})

// --- Date Periods ---
// const { currentStart, currentEnd, previousStart, previousEnd } = calculatePeriodDates()

// Force 12 Months Rolling (Default)
const currentEnd = new Date()
const currentStart = subMonths(currentEnd, 12)
const previousEnd = subMonths(currentEnd, 12)
const previousStart = subMonths(currentEnd, 24)

// --- Helper Functions ---
const m2ToHa = (m2) => (m2 || 0) / 10000

// Logic from Streamlit
const getSeverity = (event) => {
    // Priority: score > 0.5 -> high, else medium (unless string 'high')
    if (typeof event.score === 'number') {
        return event.score > 0.5 ? 'high' : 'medium'
    }
    // Fallback on string check matching Streamlit
    const s = String(event.severity || '').toLowerCase()
    if (s.includes('high') || s.includes('fort') || s.includes('élevée') || s === 'high') return 'high'
    if (s.includes('moyenne') || s.includes('medium') || s === 'medium') return 'medium'
    return 'low' 
}

// Color logic EXACTLY from Streamlit
const getEventColor = (severity, status) => {
    const st = (status || '').toLowerCase()
    if (st === 'archived') {
        return [138, 43, 226, 255] // BlueViolet
    }
    
    // Severity string normalized by getSeverity, but let's re-check raw if needed or trust helper
    // Streamlit logic:
    // Red (High)
    if (severity === 'high') return [235, 87, 87, 255] 
    // Orange (Medium)
    if (severity === 'medium') return [242, 153, 74, 255]
    // Yellow (Low/Default)
    return [255, 235, 59, 255]
}

// --- Data Fetching ---
onMounted(async () => {
    // Failsafe: Force stop loading after 5 seconds if API hangs
    const timeout = setTimeout(() => {
        if (isLoading.value) {
            console.warn("Loading timed out, forcing map display")
            isLoading.value = false
        }
    }, 5000)

  try {
    const [plotsRes, eventsRes] = await Promise.all([
      api.fetchPlots(),
      api.fetchEvents()
    ])
    
    plots.value = Array.isArray(plotsRes.data) ? plotsRes.data : (plotsRes.data.data || [])
    events.value = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.data || [])

    // Calc max surface for slider
    const areas = events.value.map(e => m2ToHa(e.area))
    if (areas.length > 0) {
        maxSurface.value = Math.ceil(Math.max(...areas))
        surfaceRange.value = [0, maxSurface.value]
    }

  } catch (e) {
    console.error("Failed to load map data", e)
  } finally {
    clearTimeout(timeout)
    isLoading.value = false
  }
})

// --- Computed Data for Map ---

// 1. Filtered Forests (Geometries) 
// Streamlit: show_forests = False. We pass empty array or handle "don't show".
// However, we DO use them for zoom centering if needed.
// Le's keep the computation but maybe not pass to ForestMap if we want to hide?
// Or better: filter them here normally, but ForestMap component will render if passed.
// User code: "Désactivé : on n'affiche plus la géométrie des forêts".
// So lets return empty array for rendering, but we might need bounds...
// Let's pass them to ForestMap, but add a prop `showForests`? Or just filter empty.
// I will just return [] for rendering purposes.
// 1. Filtered Forests (Geometries) 
const filteredForests = computed(() => {
    if (selectedForest.value) {
        return forests.value.filter(f => String(f.id) === String(selectedForest.value))
    }
    return [] // Don't show all forests by default to avoid clutter, or show all?
    // User said "slide to that forest", implying when selected.
})

// 2. Filtered Plots
const availablePlots = computed(() => {
    if (selectedForest.value) {
        return plots.value.filter(p => String(p.forestId || p.forest_id) === String(selectedForest.value))
    }
    return plots.value
})

const filteredPlots = computed(() => {
    let result = availablePlots.value

    // Filter by selected Plot specific filter
    if (selectedPlot.value && selectedPlot.value !== 'all') {
        result = result.filter(p => String(p.id) === String(selectedPlot.value))
    }

    return result.map(p => {
        let geometry = p.geom
        
        // Fix: Ensure geometry is an object if API returns string
        if (typeof geometry === 'string') {
            try {
                geometry = JSON.parse(geometry)
            } catch (e) {
                console.warn("Failed to parse geometry for plot:", p.id, e)
                geometry = null
            }
        }

        // DEBUG LOG
        if (!geometry) console.warn("Plot missing geom:", p.id, p.name)
        
        return {
            id: p.id,
            name: p.name,
            geometry: geometry // Pass sanitized geometry
        }
    }).filter(p => p.geometry && p.geometry.coordinates && p.geometry.coordinates.length > 0)
})

// 3. Filtered Events
const filteredEvents = computed(() => {
    return events.value.filter(e => {
        // --- 1. Date Filter ---
        // --- 1. Date Filter ---
        let eventDate = e.confirmationDate || e.createdAt
        if (eventDate) {
            try {
                const date = parseISO(eventDate)
                if (isNaN(date.getTime())) {
                    // Invalid date, skip or include? Streamlit skips
                    return false
                }
                if (!isWithinInterval(date, { start: currentStart, end: currentEnd })) {
                    return false
                }
            } catch (err) {
                console.warn("Invalid date for event", e.id, err)
                return false
            }
        }

        // --- 2. Forest Filter (via Plots) ---
        const validPlotIds = availablePlots.value.map(p => p.id)
        const ePlotId = e.plotId !== undefined ? e.plotId : e.plot_id
        if (!validPlotIds.some(id => String(id) === String(ePlotId))) return false

        // --- 3. Specific Plot Filter ---
        if (selectedPlot.value && selectedPlot.value !== 'all') {
             if (String(ePlotId) !== String(selectedPlot.value)) return false
        }

        // --- 4. Severity Filter ---
        const sev = getSeverity(e) 
        if (selectedSeverity.value !== 'all') {
            // Mapping: 'high' -> 'high', 'medium' -> 'medium'
            if (sev !== selectedSeverity.value) return false
        }

        // --- 5. Surface Filter ---
        const areaHa = m2ToHa(e.area)
        if (areaHa < surfaceRange.value[0] || areaHa > surfaceRange.value[1]) return false

        // --- 6. Status Filter ---
        const status = (e.status || '').toLowerCase()
        if (selectedStatus.value !== 'all') {
            // Match Streamlit 'archived' check?
            // If selectedStatus is 'Archived', we match.
            // Just direct string match
             if (status !== selectedStatus.value.toLowerCase()) return false
        }

        return true
    }).map(e => {
        // Map to display format
        // Need lat/lon from geom
        let lat = 46.6
        let lon = 1.8
        
        try {
            if (e.geom && Array.isArray(e.geom.coordinates) && e.geom.coordinates.length > 0) {
                 const coords = e.geom.coordinates
                 if (e.geom.type === 'Point') {
                     if (coords.length >= 2) {
                         lon = coords[0]
                         lat = coords[1]
                     }
                 } else if (e.geom.type === 'Polygon') {
                     // Centroid approx or first point
                     // Expecting coords[0][0] to be [lon, lat]
                     if (Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && coords[0][0].length >= 2) {
                         lon = coords[0][0][0]
                         lat = coords[0][0][1]
                     }
                 }
            }
        } catch (err) {
            console.warn("Error parsing event geometry", e.id, err)
        }

        const sev = getSeverity(e)
        // Recalc color based on status/severity
        const color = getEventColor(sev, e.status)

        return {
            id: e.id,
            severity: sev,
            area: m2ToHa(e.area),
            status: e.status,
            latitude: lat,
            longitude: lon,
            color,
            date: e.confirmationDate || e.createdAt // ADDED
        }
    })
})

// --- Sample Coord Debug ---
const getSampleCoord = computed(() => {
    if (filteredPlots.value.length > 0) {
        const p = filteredPlots.value[0]
        if (p.geometry) {
             // Return raw geometry structure snippet
             return JSON.stringify(p.geometry).slice(0, 150) + "..."
        }
    }
    return 'No Geometry found'
})

// --- Options Computeds ---
const plotOptions = computed(() => {
    // Show plots belonging to selected Forest (or all if none)
    // Similar to availablePlots but just for the dropdown
    return availablePlots.value.map(p => ({
        id: p.id,
        name: p.name || `Parcelle ${p.id}`
        // Deduplicate logic? Vue handles unique keys in v-for usually
    })).sort((a,b) => a.name.localeCompare(b.name)) // Sort by name
})

const severityOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'high', label: 'Forte' },
    { value: 'medium', label: 'Moyenne' }
]

const statusOptions = computed(() => {
    // Extract unique statuses from events
    const statuses = new Set(events.value.map(e => e.status || '').filter(s => s))
    const opts = [{ value: 'all', label: 'Tous' }]
    statuses.forEach(s => opts.push({ value: s, label: s }))
    return opts
})

</script>

<template>
    <main class="main-content">
        <div class="map-page">


            <div class="content-wrapper glass-panel">
            <!-- Toolbar / Filters -->
            <div class="toolbar">
                <div class="filters-row">
                    <!-- Parcelle Filter -->
                    <div class="filter-group">
                        <label>Parcelle</label>
                        <select v-model="selectedPlot" class="filter-select">
                            <option value="all">Tous</option>
                            <option v-for="plot in plotOptions" :key="plot.id" :value="plot.id">
                                {{ plot.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Severity Filter -->
                    <div class="filter-group">
                        <label>Sévérité</label>
                        <select v-model="selectedSeverity" class="filter-select">
                            <option v-for="opt in severityOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div class="filter-group">
                        <label>Statut</label>
                        <select v-model="selectedStatus" class="filter-select">
                            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                    </div>
                    
                    <!-- Surface Slider (Simple Input for now) -->
                    <div class="filter-group">
                        <label>Surface Max (ha): {{ surfaceRange[1] }}</label>
                        <input 
                        type="range" 
                        v-model.number="surfaceRange[1]" 
                        :min="0" 
                        :max="maxSurface" 
                        step="0.1"
                        class="range-slider"
                        />
                    </div>

                    <!-- View Toggle -->
                    <div class="filter-group toggle-group">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="is3D" class="custom-checkbox">
                            <span>Vue 3D</span>
                        </label>
                    </div>
                </div>
            </div>



            <!-- Map Container -->
            <div class="map-container" v-if="!isLoading">
                <ForestMap 
                    :forests="filteredForests"
                    :plots="filteredPlots"
                    :events="filteredEvents"
                    :dimension="is3D ? '3D' : '2D'"
                    @select-plot="selectedPlot = $event"
                />
            </div>
            <div v-else class="loading-state">
                <p>Chargement de la carte...</p>
            </div>
            </div>
        </div>
    </main>
</template>

<style scoped>

/* Map Page Specifics */
.map-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
}

.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    min-height: 600px;
}

.toolbar {
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.filters-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: flex-end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-group label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
}

.filter-select {
    padding: 0.5rem;
    border-radius: var(--radius-md);
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.3);
    color: white;
    min-width: 150px;
    outline: none;
}

.range-slider {
    width: 150px;
    accent-color: #32D583;
}

:global([data-theme="dark"]) .range-slider {
    accent-color: #B7F06A !important;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: white;
    font-weight: 500;
}

.map-container {
    flex: 1;
    min-height: 500px;
    border-radius: var(--radius-md);
    overflow: hidden;
    position: relative;
    background-color: #1e293b; /* Fallback dark background */
}

/* Custom Checkbox Reset for Full Control */
.custom-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 1.2rem;
    height: 1.2rem;
    border: 1px solid rgba(255,255,255,0.4);
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    background-color: transparent;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.custom-checkbox:hover {
    border-color: rgba(255,255,255,0.8);
}

/* Light Theme (Default) - Green bg, White Tick */
.custom-checkbox:checked {
    background-color: #32D583;
    border-color: #32D583;
}

.custom-checkbox:checked::after {
    content: '✔';
    font-size: 0.8rem;
    color: white; /* Forced White Tick */
    font-weight: bold;
}

/* Dark Theme - Neon Yellow bg, Black Tick (for contrast) */
:global([data-theme="dark"]) .custom-checkbox:checked {
    background-color: #B7F06A !important;
    border-color: #B7F06A !important;
}

:global([data-theme="dark"]) .custom-checkbox:checked::after {
    color: black !important;
}
</style>
