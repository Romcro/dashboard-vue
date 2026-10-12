<template>
  <div class="forest-table-container">
    <div class="table-header">
      <h3>Liste des Forêts</h3>
      <div class="search-wrapper">
         <input 
           type="text" 
           v-model="searchQuery" 
           placeholder="Rechercher une forêt..." 
           class="search-input"
         />
      </div>
    </div>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Statut</th>
            <th>Forêt</th>
            <th>Evénements</th>
            <th>Sévérité Forte</th>
            <th>Surface (ha)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="forest in filteredRows" :key="forest.name" class="forest-row">
            <td>
              <span class="status-badge" :class="getRiskLevel(forest)">
                {{ getRiskLevelLabel(forest) }}
              </span>
            </td>
            <td class="forest-name">{{ forest.name }}</td>
            <td class="text-right">{{ forest.events }}</td>
            <td class="text-right">{{ forest.highSeverityCount }}</td>
            <td class="text-right">{{ forest.surface.toFixed(2) }}</td>
          </tr>
          <tr v-if="filteredRows.length === 0">
              <td colspan="5" class="empty-state">Aucune forêt trouvée</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  }
})

const searchQuery = ref('')

const getRiskLevel = (forest) => {
    // Simple logic: If High Severity > 5 => Critical, > 0 => Watch, else Normal
    // Or based on total events. Let's maximize usage of "High Severity"
    if (forest.highSeverityCount > 5) return 'critical'
    if (forest.highSeverityCount > 0) return 'risk'
    if (forest.events > 0) return 'watch' // Has events but low severity
    return 'normal'
}

const getRiskLevelLabel = (forest) => {
    const level = getRiskLevel(forest)
    const map = {
        'critical': 'Critique',
        'risk': 'Risque',
        'watch': 'A surveiller',
        'normal': 'Sain'
    }
    return map[level]
}

const filteredRows = computed(() => {
    let data = props.rows
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        data = data.filter(f => f.name.toLowerCase().includes(q))
    }
    // Sort by Risk (Critical first), then Events count
    return data.sort((a, b) => {
        const riskScore = (f) => {
             if (f.highSeverityCount > 5) return 3
             if (f.highSeverityCount > 0) return 2
             if (f.events > 0) return 1
             return 0
        }
        const scoreA = riskScore(a)
        const scoreB = riskScore(b)
        if (scoreB !== scoreA) return scoreB - scoreA
        return b.events - a.events
    })
})
</script>

<style scoped>
.forest-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    padding: 0.5rem 1rem;
    color: var(--color-text-main);
    outline: none;
    font-size: 0.9rem;
    width: 250px;
    transition: all 0.2s;
}

.search-input:focus {
    border-color: var(--color-accent);
    background: rgba(255, 255, 255, 0.1);
}

.table-scroll {
    overflow-x: auto;
    overflow-y: auto;
    flex: 1; /* Take remaining height */
    max-height: 400px; /* Optional cap */
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  text-align: left;
  padding: 0.75rem 1rem;
  color: var(--color-text-muted);
  font-weight: 600;
  border-bottom: 1px solid rgba(128,128,128, 0.1);
  white-space: nowrap;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(128,128,128, 0.05);
  color: var(--color-text-main);
}

.text-right { text-align: right; }

.forest-name {
    font-weight: 600;
}

/* Badges */
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

.status-badge.watch {
    background: rgba(234, 179, 8, 0.2);
    color: var(--color-status-watch);
    border: 1px solid rgba(234, 179, 8, 0.3);
}

.status-badge.normal {
    background: rgba(16, 185, 129, 0.2);
    color: var(--color-status-normal);
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-muted);
}
</style>
