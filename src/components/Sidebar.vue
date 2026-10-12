<script setup>
import { computed, ref } from 'vue'
import { useDashboardState } from '../composables/useDashboardState'
import { useTheme } from '../composables/useTheme'
import ThemeToggle from './ThemeToggle.vue'

const { selectedForest, setSelectedForest, forests } = useDashboardState()
const { isDark, layoutMode } = useTheme()
const showForestModal = ref(false)

const logoWhite = new URL('../assets/logo/canopee-dark.svg', import.meta.url).href
const logoClair = new URL('../assets/logo/canopee-light.svg', import.meta.url).href
const logoMiniLight = new URL('../assets/logo/canopee-mini-light.svg', import.meta.url).href
const logoMiniDark = new URL('../assets/logo/canopee-mini-dark.svg', import.meta.url).href

const logoSrc = computed(() => {
  if (isMini.value) {
      return isDark.value ? logoMiniDark : logoMiniLight
  }
  return isDark.value ? logoWhite : logoClair
})

// Icons
const Icons = {
  Dashboard: {
    template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`
  },
  Map: {
    template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>`
  },
  Settings: {
    template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
  },
  Forest: {
     template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L3 14h5l-2 8h12l-2-8h5L12 2z"/></svg>`
  }
}

const isSideLayout = computed(() => layoutMode.value === 'side-full' || layoutMode.value === 'side-mini')
const isMini = computed(() => layoutMode.value === 'side-mini')
</script>

<template>
    <header class="app-navbar" :class="[{ 'is-dark': isDark, 'is-side': isSideLayout, 'is-mini': isMini }, layoutMode]">
      <div class="navbar-content">
          <!-- Left: Brand -->
          <div class="navbar-brand">
              <div class="brand">
                <img :src="logoSrc" alt="Canopée" class="brand-logo" />
              </div>
          </div>

          <!-- Forest Selector (Outside Menu in Sidebar mode) -->
          <div class="forest-selector-wrapper" v-if="isSideLayout && !isMini">
             <div class="forest-selector">
                <select :value="selectedForest || 'all'" @change="e => setSelectedForest(e.target.value === 'all' ? null : e.target.value)">
                  <option value="all">Toutes les forêts</option>
                  <option v-for="forest in forests" :key="forest.id" :value="forest.id">
                    {{ forest.name }}
                  </option>
                </select>
            </div>
          </div>

          <!-- Mini Mode Forest Trigger -->
          <div class="mini-forest-trigger" v-if="isMini" @click="showForestModal = true" title="Changer de forêt">
             <div class="nav-item">
                <svg class="nav-icon" style="width: 24px; height: 24px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L3 14h5l-2 8h12l-2-8h5L12 2z"/></svg>
             </div>
          </div>

          <!-- Main Navigation -->
          <nav class="nav-menu" :class="{ 'nav-menu-pill': !isSideLayout, 'nav-menu-side': isSideLayout }">
            
            <!-- Forest Selector (Inside Pill for Top Mode) -->
            <div class="forest-selector" v-if="!isSideLayout">
                <select :value="selectedForest || 'all'" @change="e => setSelectedForest(e.target.value === 'all' ? null : e.target.value)">
                  <option value="all">Toutes les forêts</option>
                  <option v-for="forest in forests" :key="forest.id" :value="forest.id">
                    {{ forest.name }}
                  </option>
                </select>
            </div>

            <div class="pill-divider desktop-only" v-if="!isSideLayout"></div>

            <!-- Nav Links -->
            <router-link to="/" class="nav-item" active-class="active" title="Tableau de bord">
                <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                <span class="nav-text" v-if="!isMini">Tableau de bord</span>
            </router-link>
            
            <router-link to="/map" class="nav-item" active-class="active" title="Carte">
                 <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
                <span class="nav-text" v-if="!isMini">Carte</span>
            </router-link>
            
            <router-link to="/settings" class="nav-item" active-class="active" title="Paramètres">
                 <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                <span class="nav-text" v-if="!isMini">Paramètres</span>
            </router-link>

            <div class="pill-divider desktop-only" v-if="!isSideLayout"></div>

            <!-- User & Theme (Inside Pill for Top Mode) -->
            <div class="nav-controls" v-if="!isSideLayout">
                <ThemeToggle class="nav-theme" />
                <div class="user-avatar" title="Profil Utilisateur">DM</div>
            </div>
          </nav>

      <!-- User & Theme (Bottom of Sidebar for Side Mode) -->
          <div class="sidebar-footer" v-if="isSideLayout">
             <ThemeToggle class="nav-theme" />
             <div class="user-avatar" title="Profil Utilisateur">DM</div>
          </div>
      </div>
    </header>

    <!-- Modal Overlay -->
    <teleport to="body">
        <div class="forest-modal-overlay" v-if="showForestModal" @click.self="showForestModal = false">
        <div class="forest-modal" :class="{ 'is-dark': isDark }">
            <div class="modal-title">Choisir une forêt</div>
            <div class="modal-list">
                <div class="forest-option" 
                        :class="{ active: !selectedForest || selectedForest === 'all' }" 
                        @click="setSelectedForest(null); showForestModal = false">
                    🌲 Toutes les forêts
                </div>
                <div v-for="forest in forests" 
                        :key="forest.id" 
                        class="forest-option"
                        :class="{ active: selectedForest === forest.id }"
                        @click="setSelectedForest(forest.id); showForestModal = false">
                    📍 {{ forest.name }}
                </div>
            </div>
            <button class="modal-close" @click="showForestModal = false">Fermer</button>
        </div>
        </div>
    </teleport>
</template>

<style scoped>
/* Modal */
.forest-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}
.forest-modal {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    display: flex;
    flex-direction: column;
    max-height: 80vh;
}
.forest-modal.is-dark {
    background: var(--color-bg-surface);
    color: white;
    border: 1px solid rgba(255,255,255,0.1);
}

.modal-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
}
.modal-list {
    overflow-y: auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
.forest-option {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    background: #f8fafc;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    color: #334155;
}
.forest-option:hover { background: #e2e8f0; }
.forest-option.active {
    background: #0f172a;
    color: white;
}

/* Dark Mode Modal Items */
.forest-modal.is-dark .forest-option {
    background: rgba(255,255,255,0.05);
    color: #e2e8f0;
}
.forest-modal.is-dark .forest-option:hover { background: rgba(255,255,255,0.1); }
.forest-modal.is-dark .forest-option.active {
    background: #B7F06A;
    color: black;
}

.modal-close {
    margin-top: 1rem;
    padding: 0.75rem;
    background: transparent;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
.forest-modal.is-dark .modal-close { border-color: rgba(255,255,255,0.1); color: white; }

.mini-forest-trigger {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    cursor: pointer;
}
.mini-forest-trigger .nav-item {
    background: #f1f5f9;
    color: #334155;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}
.app-navbar.is-dark .mini-forest-trigger .nav-item {
    background: rgba(255,255,255,0.1);
    color: white;
}
.mini-forest-trigger .nav-item:hover {
    background: #e2e8f0;
}

/* --- ICON STYLES --- */
.nav-icon {
    width: 20px;
    height: 20px;
    opacity: 0.8;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* --- BASE STYLES --- */
.app-navbar {
    z-index: 100;
}

.forest-selector select {
    padding: 0.4rem 1rem;
    border-radius: 20px;
    border: none;
    background: #f1f5f9;
    color: #334155;
    outline: none;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    font-weight: 500;
}
.app-navbar.is-dark .forest-selector select {
    background: rgba(255,255,255,0.1);
    color: #e2e8f0;
}

/* --- TOP PILL LAYOUT (DEFAULT) --- */
.app-navbar.top {
    position: sticky;
    top: 1rem;
    width: 100%;
    margin-bottom: 2rem;
}

.app-navbar.top .navbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    width: 90%;
    max-width: 1600px; /* Match App.vue content max-width */
    margin: 0 auto;
}

.app-navbar.top .brand-logo { height: 32px; }

.nav-menu-pill {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: white;
    padding: 0.5rem 0.75rem;
    border-radius: 9999px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.03);
}

.app-navbar.is-dark .nav-menu-pill {
    background: var(--color-bg-surface);
    border: 1px solid rgba(255,255,255,0.05);
    /* backdrop-filter: blur(10px); - Removed for surface consistency */
}

.nav-menu-pill .nav-item {
    text-decoration: none;
    color: #64748b;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.9rem;
    font-weight: 500;
}

.nav-menu-pill .nav-item:hover {
    color: #1e293b;
    background-color: #f1f5f9;
}

.app-navbar.is-dark .nav-menu-pill .nav-item { color: #94a3b8; }
.app-navbar.is-dark .nav-menu-pill .nav-item:hover { 
    color: white; 
    background-color: rgba(255,255,255,0.05);
}

.nav-menu-pill .nav-item.active {
    background-color: #0f172a;
    color: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.app-navbar.is-dark .nav-menu-pill .nav-item.active {
    background-color: #B7F06A;
    color: black;
}

.nav-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* --- SIDEBAR LAYOUT (FULL & MINI) --- */
.app-navbar.side-full, .app-navbar.side-mini {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    background: white;
    border-right: 1px solid var(--color-border, #e2e8f0);
    padding: 1.5rem;
    transition: width 0.3s ease;
}

.app-navbar.is-dark.side-full, .app-navbar.is-dark.side-mini {
    background: var(--color-bg-surface);
    border-right: 1px solid rgba(255,255,255,0.05);
}

.app-navbar.side-full { width: 260px; }
.app-navbar.side-mini { width: 88px; }

.app-navbar.is-side .navbar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 2rem;
}

.app-navbar.is-side .brand-logo {
    height: 40px;
    margin-bottom: 0.5rem;
}

.navbar-brand {
    padding-left: 0.5rem;
}

.app-navbar.is-mini .navbar-brand {
    display: flex;
    justify-content: center;
    padding-left: 0;
}

.forest-selector-wrapper {
    width: 100%;
}
.app-navbar.is-mini .forest-selector-wrapper { display: none; } /* Hide forest selector in mini mode or show icon? */

.nav-menu-side {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.nav-menu-side .nav-item {
    text-decoration: none;
    color: #64748b;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
}

.app-navbar.is-dark .nav-menu-side .nav-item { color: #94a3b8; }

.app-navbar.is-mini .nav-menu-side .nav-item {
    justify-content: center;
    padding: 0.75rem;
}

.nav-menu-side .nav-item:hover {
    background: #f1f5f9;
    color: #0f172a;
}
.app-navbar.is-dark .nav-menu-side .nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: white;
}

.nav-menu-side .nav-item.active {
    background: #f1f5f9;
    color: #0f172a; /* Brand Primary */
    border-left: 3px solid #0f172a; /* Side Marker */
    border-radius: 0 8px 8px 0;
    margin-left: -1.5rem;
    padding-left: calc(1rem + 1.25rem); /* Adjust for margin shift */
}

.app-navbar.is-dark .nav-menu-side .nav-item.active {
    background: rgba(255,255,255,0.05);
    color: #B7F06A;
    border-left: 3px solid #B7F06A;
}

.app-navbar.is-mini .nav-menu-side .nav-item.active {
    margin-left: -1.5rem;
    padding-left: 1.5rem; /* Reset padding for mini */
    border-left: 3px solid #0f172a;
    justify-content: center;
    padding-right: 0;
}
.app-navbar.is-dark.is-mini .nav-menu-side .nav-item.active {
     border-left: 3px solid #B7F06A;
}


/* Sidebar Footer */
.sidebar-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.app-navbar.is-dark .sidebar-footer {
    border-top: 1px solid rgba(255,255,255,0.1);
}

.app-navbar.is-mini .sidebar-footer {
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
}

/* --- UTILS --- */
.pill-divider {
    width: 1px;
    height: 20px;
    background-color: #e2e8f0;
    margin: 0 0.2rem;
}
.app-navbar.is-dark .pill-divider { background-color: rgba(255,255,255,0.1); }

.user-avatar {
    width: 32px;
    height: 32px;
    background-color: #32D583;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8rem;
    cursor: pointer;
}
.app-navbar.is-dark .user-avatar { background-color: #B7F06A; color: #1a1a1a; }
.desktop-only { display: block; }

/* --- RESPONSIVE MOBILE --- */
@media (max-width: 768px) {
    /* Force Bottom Pill on Mobile for ALL modes */
    .app-navbar {
        position: fixed !important;
        top: auto !important;
        bottom: 1.5rem !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: 90% !important;
        height: auto !important;
        max-width: 400px;
        background: transparent !important;
        border: none !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    .navbar-content {
        padding: 0 !important;
        width: 100% !important;
        display: block !important;
        max-width: 100% !important;
    }

    .nav-menu {
        /* Reconstruct Pill Logic for Mobile */
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-around !important;
        background: white !important;
        padding: 0.5rem !important;
        border-radius: 9999px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        border: 1px solid rgba(0,0,0,0.1) !important;
        width: 100% !important;
    }
    
    .app-navbar.is-dark .nav-menu {
        background: #1e293b !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
    }

    /* Hide Desktop Elements */
    .navbar-brand, .forest-selector-wrapper, .sidebar-footer, .pill-divider, .desktop-only, .nav-text {
        display: none !important;
    }

    /* Show Icons Only in Pill */
    .nav-item {
        padding: 0.5rem !important;
        margin: 0 !important;
        border: none !important;
        border-radius: 50% !important;
    }
    
    .nav-menu-side .nav-item.active {
        background: transparent !important;
        color: var(--color-primary) !important;
        border: none !important;
        margin: 0 !important;
        padding: 0.5rem !important;
    }
    /* Ensure icons are visible */
    .nav-icon {
        display: block !important;
    }
}
</style>
