<script setup>
import { computed } from 'vue'

const props = defineProps({
  alerts: {
    type: Array,
    default: () => []
  }
})

// Columns configuration
const columns = [
  { key: 'plotId', label: 'ID Parcelle' },
  { key: 'severity', label: 'Sévérité' },
  { key: 'area', label: 'Surface (ha)' },
  { key: 'confirmationDate', label: 'Date' },
  { key: 'status', label: 'Statut' }
]

const downloadCSV = () => {
  if (!props.alerts.length) return
  
  const headers = columns.map(c => c.label).join(',')
  const rows = props.alerts.map(a => columns.map(c => a[c.key]).join(','))
  const csvContent = [headers, ...rows].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'alertes.csv')
  link.click()
}

const getSeverityLabel = (sev) => {
    const s = (sev || '').toUpperCase()
    if (s === 'HIGH') return 'Critique'
    if (s === 'MEDIUM') return 'Risque'
    return 'Normal'
}

const getSeverityClass = (sev) => {
    const s = (sev || '').toUpperCase()
    if (s === 'HIGH') return 'critical'
    if (s === 'MEDIUM') return 'risk'
    return 'normal'
}
</script>

<template>
  <div class="alerts-section">
    <!-- Removed Header Button for cleaner view inside the panel (optional, user didn't ask but "overflow" might be related to height. Keeping it simple). 
         User just wanted the list. -->
    
    <div class="table-container glass-panel">
      <table class="alerts-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alert in alerts" :key="alert.id">
            <!-- Removed Forest Name Cell -->
            <td>{{ alert.plotId }}</td>
            <td>
              <span class="status-badge" :class="getSeverityClass(alert.severity)">
                  {{ getSeverityLabel(alert.severity) }}
              </span>
            </td>
            <td>{{ alert.area }} ha</td>
            <td>{{ alert.confirmationDate }}</td>
             <td>
              <span class="status-dot" :class="alert.status.toLowerCase()"></span>
              {{ alert.status }}
            </td>
          </tr>
          <tr v-if="alerts.length === 0">
            <td colspan="5" class="no-data">Aucune alerte pour cette période</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.alerts-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* Let internal container scroll */
}

/* Removed separate header to save space if needed, button can be added back if essential */

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  padding: 0;
  height: 100%; /* Fill available height */
}

.alerts-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.alerts-table th {
  background-color: rgba(99, 102, 241, 0.1); /* Indigo tint */
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-main);
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.alerts-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--color-text-muted);
  white-space: nowrap; /* Prevent wrap causing "overflow from case" vizual issues */
}

.alerts-table tr:last-child td {
  border-bottom: none;
}

/* New Status Badges matching ForestDetailsTable */
.status-badge {
    display: inline-block;
    padding: 0.25rem 0.6rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.critical {
    background: rgba(255, 107, 157, 0.2);
    color: #FF6B9D;
    border: 1px solid rgba(255, 107, 157, 0.3);
}

.status-badge.risk {
    background: rgba(249, 115, 22, 0.2);
    color: var(--color-status-risk);
    border: 1px solid rgba(249, 115, 22, 0.3);
}

.status-badge.normal {
    background: rgba(16, 185, 129, 0.2);
    color: var(--color-status-normal);
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.status-dot.active { background-color: var(--color-status-critical); box-shadow: 0 0 8px var(--color-status-critical); }
.status-dot.archived { background-color: var(--color-text-muted); }

.no-data {
  text-align: center;
  padding: 2rem;
}
</style>
