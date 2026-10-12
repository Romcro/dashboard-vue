<script setup>
import { onMounted, ref, shallowRef, markRaw, watch, onUnmounted } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import { SATELLITE_STYLE } from './mapStyle'

const emit = defineEmits(['select-plot'])

const props = defineProps({
  forests: {
    type: Array,
    default: () => []
  },
  plots: {
    type: Array,
    default: () => []
  },
  events: {
    type: Array,
    default: () => []
  },
  mapStyle: {
    type: [String, Object],
    default: () => SATELLITE_STYLE
  },
  dimension: {
    type: String,
    default: '3D'
  }
})

const mapContainer = ref(null)
const map = shallowRef(null) // Use shallowRef to avoid Proxying the map's internal state
const loaded = ref(false)
const mapError = ref(null)
const resizeInterval = ref(null)


onMounted(() => {
  if (!mapContainer.value) return

  // Use markRaw as extra safety
  map.value = markRaw(new maplibregl.Map({
    container: mapContainer.value,
    style: props.mapStyle, 
    center: [1.888334, 46.603354], 
    zoom: 5,
    pitch: props.dimension === '3D' ? 60 : 0, // Fix: Init with correct pitch
    bearing: 0,
    attributionControl: { compact: true }
  }))

  map.value.on('load', () => {
    loaded.value = true
    map.value.resize() 
    console.log("Map Loaded, resizing...")
    updateMapData()
    fitBoundsToData() // Initial fit

    // Safety: Force resize a few times
    let count = 0
    resizeInterval.value = setInterval(() => {
        if (map.value) {
            try { map.value.resize() } catch (e) { /* ignore */ }
        }
        count++
        if (count > 3) {
            if (resizeInterval.value) clearInterval(resizeInterval.value)
            resizeInterval.value = null
        }
    }, 500)

    // --- GLOBAL CLICK HANDLER ---
    map.value.on('click', (e) => {
        // 1. Check for Event (High Priority)
        const eventFeatures = map.value.queryRenderedFeatures(e.point, { layers: ['events-layer'] })
        
        if (eventFeatures.length > 0) {
            const feature = eventFeatures[0]
            const coordinates = feature.geometry.coordinates.slice()
            const props = feature.properties
            
             while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
            }
            
            // Format Date safely
            let dateStr = props.date
            try {
                if (dateStr && dateStr !== 'Date inconnue') {
                    dateStr = new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                }
            } catch(err) {}

            // Determine Severity Label/Classes
            const sev = (props.severity || '').toLowerCase()
            let badgeClass = 'normal'
            let sevLabel = 'Normal'
            
            if (sev.includes('high') || sev === 'high') { badgeClass = 'critical'; sevLabel = 'Critique' }
            else if (sev.includes('medium') || sev === 'medium') { badgeClass = 'risk'; sevLabel = 'Risque' }

            const html = `
                <div class="map-popup-card">
                    <div class="popup-header">
                        <span class="popup-title">Alerte #${props.id}</span>
                        <span class="popup-badge ${badgeClass}">${sevLabel}</span>
                    </div>
                    <div class="popup-body">
                         <div class="popup-row">
                            <span class="icon">📅</span>
                            <span>${dateStr}</span>
                         </div>
                    </div>
                </div>
            `
    
            new maplibregl.Popup({ className: 'custom-map-popup', closeButton: true, maxWidth: '200px' })
                .setLngLat(coordinates)
                .setHTML(html)
                .addTo(map.value)
                
            return // STOP here - prioritized
        }

        // 2. Check for Plot (Lower Priority)
        const plotFeatures = map.value.queryRenderedFeatures(e.point, { layers: ['plots-fill'] })
        
        if (plotFeatures.length > 0) {
             const pId = plotFeatures[0].properties.id
             console.log("Plot Clicked via Global Handler:", pId)
             emit('select-plot', pId)
        }
    })
  })



  // DEBUG: Catch map errors with detailed log
  map.value.on('error', (e) => {
    console.error("Map error:", e)
  })
})

// Watch for data changes to update map
watch(() => [props.forests, props.plots, props.events], () => {
    if (loaded.value) updateMapData()
}, { deep: true })

// Watch Forests specifically for Zooming (Context Change)
watch(() => props.forests, () => {
   if (loaded.value) {
       console.log("Forests prop changed, refitting bounds...")
       // Fix: Delay fitBounds slightly to override any concurrent pitch animation (from 3D->2D toggle)
       setTimeout(() => {
           fitBoundsToData()
       }, 200)
   }
}, { deep: true })

// Watch for dimension change
watch(() => props.dimension, (newDim) => {
    if (!map.value) return
    map.value.easeTo({
        pitch: newDim === '3D' ? 45 : 0,
        duration: 1000
    })
})

function updateMapData() {
    if (!map.value) return

    updateForestsLayer()
    updatePlotsLayer()
    updateEventsLayer()
    
    // Note: We do NOT auto-fit here anymore to prevent zooming on Plot click.
    // Zoom is handled by the props.forests watcher and initial load.
}

function updateForestsLayer() {
    const sourceId = 'forests-source'
    const layerIdFill = 'forests-fill'
    const layerIdLine = 'forests-line'

    // Clean up
    if (map.value.getLayer(layerIdLine)) map.value.removeLayer(layerIdLine)
    if (map.value.getLayer(layerIdFill)) map.value.removeLayer(layerIdFill)
    if (map.value.getSource(sourceId)) map.value.removeSource(sourceId)

    if (!props.forests || props.forests.length === 0) return

    const features = props.forests.map(f => ({
        type: 'Feature',
        geometry: {
             type: 'Polygon',
             // Ensure loop closure and proper structure
             coordinates: [f.coordinates] 
        },
        properties: {
            name: f.name,
            area: f.area
        }
    })).filter(f => f.geometry.coordinates && f.geometry.coordinates.length > 0)

    if (features.length === 0) return

    map.value.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features }
    })

    // Add Fill
    map.value.addLayer({
        id: layerIdFill,
        type: 'fill',
        source: sourceId,
        paint: {
            'fill-color': '#228B22', // Green
            'fill-opacity': 0.3
        }
    })

    // Add Outline
    map.value.addLayer({
        id: layerIdLine,
        type: 'line',
        source: sourceId,
        paint: {
            'line-color': '#228B22',
            'line-width': 2
        }
    })
}

function updatePlotsLayer() {
    const sourceId = 'plots-source'
    const layerIdFill = 'plots-fill'
    const layerIdLine = 'plots-line'

    if (map.value.getLayer(layerIdLine)) map.value.removeLayer(layerIdLine)
    if (map.value.getLayer(layerIdFill)) map.value.removeLayer(layerIdFill)
    if (map.value.getSource(sourceId)) map.value.removeSource(sourceId)

    if (!props.plots || props.plots.length === 0) {
        console.log("No plots to render")
        return
    }
    console.log("Rendering plots:", props.plots.length)

    const features = props.plots.map(p => {
        // Fix: Strip Vue Proxies to ensure the map receives plain JS objects
        const rawGeometry = p.geometry ? JSON.parse(JSON.stringify(p.geometry)) : null
        
        return {
            type: 'Feature',
            geometry: rawGeometry, 
            properties: {
                id: p.id,
                name: p.name || `Parcelle ${p.id}`
            }
        }
    }).filter(p => p.geometry)

    if (features.length === 0) return

    map.value.addSource(sourceId, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features }
    })

    // Unified Fill + Outline Layer (More robust for MultiPolygons)
    map.value.addLayer({
        id: layerIdFill,
        type: 'fill',
        source: sourceId,
        paint: {
            'fill-color': '#beff00', // Lime
            'fill-opacity': 0.2,
            'fill-outline-color': '#dc2626' // Red-600 for max visibility
        }
    })

    // Click handler removed - managed globally in onMounted

    // Cursor style
    map.value.on('mouseenter', layerIdFill, () => {
        map.value.getCanvas().style.cursor = 'pointer'
    })
    map.value.on('mouseleave', layerIdFill, () => {
         // Reset only if not hovering an event (event layer also sets pointer)
         // But simple reset is usually fine as layers overlap
        map.value.getCanvas().style.cursor = ''
    })
}

function updateEventsLayer() {
    try {
        const sourceId = 'events-source'
        const layerId = 'events-layer'
    
        if (map.value.getLayer(layerId)) map.value.removeLayer(layerId)
        if (map.value.getSource(sourceId)) map.value.removeSource(sourceId)
    
        if (!props.events || props.events.length === 0) return
    
        const features = props.events.map(e => {
            if (!e.longitude || !e.latitude) return null
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [e.longitude, e.latitude]
                },
                properties: {
                    id: e.id,
                    severity: e.severity,
                    // Safe color access
                    color: Array.isArray(e.color) && e.color.length >= 3 
                           ? `rgba(${e.color[0]}, ${e.color[1]}, ${e.color[2]}, 1)` 
                           : 'rgba(255, 235, 59, 1)',
                    date: e.date || 'Date inconnue' // Pass date
                }
            }
        }).filter(f => f !== null)
    
        map.value.addSource(sourceId, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features }
        })
    
        map.value.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            paint: {
                'circle-radius': 6,
                'circle-color': ['get', 'color'],
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff',
                'circle-opacity': 0.8
            }
        })
        
        // Click handler removed - managed globally in onMounted

        // Cursor style
        map.value.on('mouseenter', layerId, () => {
            map.value.getCanvas().style.cursor = 'pointer'
        })
        map.value.on('mouseleave', layerId, () => {
            map.value.getCanvas().style.cursor = ''
        })
    } catch (err) {
        console.error("Error updating events layer:", err)
    }
}

function fitBoundsToData() {
    // Collect all coordinates
    const bounds = new maplibregl.LngLatBounds()
    let hasData = false

    const isValidCoord = (lon, lat) => {
        return typeof lon === 'number' && typeof lat === 'number' &&
               !isNaN(lon) && !isNaN(lat) &&
               Math.abs(lat) <= 90 && Math.abs(lon) <= 180
    }

    // Forests
    if (props.forests) {
        props.forests.forEach(f => {
            if (f.coordinates) {
                 f.coordinates.forEach(coord => {
                     // Polygon ring: [lon, lat]
                     if (Array.isArray(coord) && coord.length >= 2) {
                         const [lon, lat] = coord
                         if (isValidCoord(lon, lat)) {
                             bounds.extend([lon, lat])
                             hasData = true
                         }
                     }
                 })
            }
        })
    }
    
    // Plots 
    // Plots 
    if (props.plots) {
        console.log("Fitting to plots...", props.plots.length)
        props.plots.forEach(p => {
            if (p.geometry && p.geometry.coordinates) {
                 // Deep clone to avoid proxy issues during traversal
                 const rawCoords = JSON.parse(JSON.stringify(p.geometry.coordinates))
                 
                 // Recursively find all points
                 const flattenCoords = (coords) => {
                     if (Array.isArray(coords)) {
                         // Fix: Handle 2D [x,y] AND 3D [x,y,z] coordinates
                         if (coords.length >= 2 && typeof coords[0] === 'number') {
                             // Point [lon, lat, (alt)]
                             if (isValidCoord(coords[0], coords[1])) {
                                  bounds.extend([coords[0], coords[1]]) // Only take first 2
                                  hasData = true
                             }
                         } else {
                             coords.forEach(c => flattenCoords(c))
                         }
                     }
                 }
                 // Fix: Use the DEEP CLONED coordinates
                 flattenCoords(rawCoords)
            }
        })
    }

    // Events
    if (props.events) {
        props.events.forEach(e => {
            if (isValidCoord(e.longitude, e.latitude)) {
                bounds.extend([e.longitude, e.latitude])
                hasData = true
            }
        })
    }

    if (hasData) {
        console.log("Fitting bounds:", bounds.toArray())
        try {
            map.value.fitBounds(bounds, {
                padding: 50,
                maxZoom: 16,
                duration: 2000, // Smooth glide (2s)
                essential: true // Respect user's prefers-reduced-motion but force for logic
            })
            console.log("Map bounds updated.")
        } catch (err) {
            console.warn("Bounds Error:", err)
        }
    }
}

onUnmounted(() => {
    if (resizeInterval.value) clearInterval(resizeInterval.value)
    if (map.value) map.value.remove()
})
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  display: flex; /* Fix: Use flexbox to propagate height to children */
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 500px; /* Force minimum height */
  border-radius: var(--radius-md);
  overflow: hidden;
}

.map-container {
  width: 100%;
  flex: 1; /* Fix: Fill parent height */
}
</style>

<style>
/* Global styles for map popups (which render outside Vue scope) */
.maplibregl-popup-content {
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
}

.map-popup-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: hidden;
    color: #1a1a1a;
    font-family: 'Inter', sans-serif;
    min-width: 180px;
}

.popup-header {
    background: #F3F4F6;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #E5E7EB;
}

.popup-title {
    font-weight: 600;
    font-size: 0.85rem;
}

.popup-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    font-weight: 600;
    text-transform: uppercase;
}

.popup-badge.critical { background: #FECACA; color: #DC2626; }
.popup-badge.risk { background: #FFEDD5; color: #EA580C; }
.popup-badge.normal { background: #D1FAE5; color: #059669; }

.popup-body {
    padding: 1rem;
}

.popup-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #4B5563;
}

.popup-row .icon {
    font-size: 1rem;
}

/* Custom Close Button Styling */
.custom-map-popup .maplibregl-popup-close-button {
    font-size: 1.2rem;
    color: #6B7280; /* Gray-500 */
    padding: 0.2rem 0.5rem;
    right: 4px;
    top: 4px;
    border-radius: 4px;
    transition: all 0.2s;
    background: transparent;
    border: none;
    z-index: 10;
}

.custom-map-popup .maplibregl-popup-close-button:hover {
    background-color: rgba(0,0,0,0.05);
    color: #111827; /* Gray-900 */
}
</style>
