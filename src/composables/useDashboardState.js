import { ref, computed } from 'vue'

const selectedForest = ref(null) // null = "Toutes les forêts"
const forests = ref([]) // Global list of forests
const dateRange = ref('Analyse en cours')
const userEmail = ref('demo@canopee.app')

// Default logic for "Analyse en cours" typically means "Last 12 months" or similar in the original app
const currentPeriod = computed(() => {
    const end = new Date()
    const start = new Date()
    start.setFullYear(start.getFullYear() - 1)
    return { start, end }
})

export function useDashboardState() {
    const setSelectedForest = (forestId) => {
        // Ensure strictly string or null for consistency
        selectedForest.value = forestId ? String(forestId) : null
    }

    const setDateRange = (range) => {
        dateRange.value = range
    }

    const setForests = (data) => {
        forests.value = data
    }

    return {
        selectedForest,
        forests,
        dateRange,
        userEmail,
        currentPeriod,
        setSelectedForest,
        setDateRange,
        setForests
    }
}
