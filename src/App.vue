<script setup>
import { onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import api from './services/api'
import { useDashboardState } from './composables/useDashboardState'
import { useTheme } from './composables/useTheme'
import { watchAuth, DEMO } from './firebase'

const route = useRoute()
const { setForests } = useDashboardState()
const { layoutMode } = useTheme()

// Check if current route is Login (or other standalone pages) to hide sidebar
const showSidebar = computed(() => {
  return route.name !== 'Login' && route.path !== '/login'
})

// Computed classes for layout adjustment
const layoutClasses = computed(() => {
    if (!showSidebar.value) return ''
    if (layoutMode.value === 'side-full') return 'layout-side-full'
    if (layoutMode.value === 'side-mini') return 'layout-side-mini'
    return 'layout-top'
})

// Fetch forests ONLY when authenticated
onMounted(() => {
// ... existing code ...
    watchAuth(async (user) => {
        if (user) {
            console.log("User authenticated, fetching global data...")
            try {
                const res = await api.fetchForests()
                const data = Array.isArray(res.data) ? res.data : (res.data.data || [])
                setForests(data)
                console.log("Global Forests Loaded:", data.length)
            } catch (e) {
                console.error("Failed to load global forests", e)
            }
        } else {
            console.log("User not authenticated, skipping data fetch.")
            setForests([])
        }
    })
})
</script>

<template>
  <div class="app-container" :class="layoutClasses">
    <Sidebar v-if="showSidebar" />
    
    <div :class="['content-area', { 'full-width': !showSidebar }]">
        <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
    <a v-if="DEMO" class="demo-badge" href="https://romcro.github.io/Romcro/" title="Retour au portfolio">Démo · données fictives</a>
  </div>
</template>

<style>
.demo-badge {
    position: fixed; right: 16px; bottom: 16px; z-index: 50;
    font: 500 12px/1 Poppins, system-ui, sans-serif; letter-spacing: .02em;
    padding: 8px 12px; border-radius: 999px; text-decoration: none;
    background: rgba(26, 26, 26, .82); color: #B7F06A; border: 1px solid rgba(183, 240, 106, .35);
    backdrop-filter: blur(6px);
}
/* Global Layout Base */
.app-container {
    display: flex;
    flex-direction: column; /* Stack TopBar and Content vertically */
    min-height: 100vh;
    background-color: var(--color-bg); 
    gap: 2rem; /* Creates space between Navbar and Page Content */
    transition: padding-left 0.3s ease;
}

/* SIDEBAR LAYOUT ADJUSTMENTS */
.app-container.layout-side-full {
    padding-left: 260px;
}

.app-container.layout-side-mini {
    padding-left: 88px;
}

.content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; 
    padding: 2rem 0; /* Remove horizontal padding to match Navbar width */
    width: 90%; /* User request: 90% width */
    max-width: 1600px;
    margin: 0 auto; /* Center content */
}

.full-width {
    padding: 0;
}

@media (max-width: 768px) {
    .app-container {
        padding-top: 0;
        padding-bottom: 80px; /* Space for fixed Bottom Nav */
        padding-left: 0 !important; /* Reset sidebar padding on mobile */
    }
    
    .content-area {
        padding: 1rem;
        height: auto; /* Let content flow naturally on mobile */
        overflow-y: visible;
        max-width: 100%;
    }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
