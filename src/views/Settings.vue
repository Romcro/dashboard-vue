<script setup>
import { useTheme } from '../composables/useTheme'

const { isDark, layoutMode, setLayout } = useTheme()

const layouts = [
  { 
    id: 'top', 
    name: 'Menu Pilule (Haut)', 
    desc: 'Menu compact et flottant en haut de l\'écran.',
    icon: 'LayoutTop' 
  },
  { 
    id: 'side-full', 
    name: 'Menu Latéral (Complet)', 
    desc: 'Menu vertical à gauche avec textes et icônes.',
    icon: 'LayoutSide' 
  },
  { 
    id: 'side-mini', 
    name: 'Menu Latéral (Icônes)', 
    desc: 'Menu vertical compact avec icônes uniquement.',
    icon: 'LayoutMini' 
  }
]
</script>

<template>
  <div class="settings-page">
    <div class="settings-container">
      <h1>Paramètres de l'application</h1>
      
      <section class="settings-section">
        <h2>Disposition du Menu</h2>
        <p class="section-desc">Choisissez l'apparence et l'emplacement du menu de navigation.</p>
        
        <div class="layout-grid">
          <div 
            v-for="layout in layouts" 
            :key="layout.id"
            class="layout-card"
            :class="{ active: layoutMode === layout.id }"
            @click="setLayout(layout.id)"
          >
            <div class="layout-preview" :class="layout.id">
              <!-- Simple CSS drawing of the layout -->
              <div class="preview-screen">
                 <div v-if="layout.id === 'top'" class="p-nav-top"></div>
                 <div v-if="layout.id === 'side-full'" class="p-nav-side is-full"></div>
                 <div v-if="layout.id === 'side-mini'" class="p-nav-side is-mini"></div>
                 <div class="p-content"></div>
              </div>
            </div>
            <div class="layout-info">
              <h3>{{ layout.name }}</h3>
              <p>{{ layout.desc }}</p>
            </div>
            <div class="check-icon" v-if="layoutMode === layout.id">✓</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding: 2rem;
  padding-top: 6rem; /* Space for top nav */
  min-height: 100vh;
  background-color: var(--color-bg-app);
}

.settings-container {
  max-width: 1000px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--color-text-main);
}

.settings-section {
  background: var(--color-bg-card);
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
}

.section-desc {
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.layout-card {
  position: relative;
  background: var(--color-bg-app);
  border: 2px solid transparent;
  padding: 1rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.layout-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.layout-card.active {
  border-color: var(--color-primary);
  background: var(--color-bg-subtle);
}

.layout-preview {
  height: 120px;
  background: #e2e8f0;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  overflow: hidden;
  position: relative;
}

.preview-screen {
  position: absolute;
  inset: 0;
  background: #f1f5f9;
  display: flex;
}

.p-nav-top {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  height: 12px;
  width: 60%;
  background: #94a3b8;
  border-radius: 10px;
}

.p-nav-side {
  height: 100%;
  background: #94a3b8;
}

.p-nav-side.is-full { width: 40px; }
.p-nav-side.is-mini { width: 12px; }

.p-content {
  flex: 1;
  margin: 10px;
  background: white;
  border-radius: 4px;
  margin-left: 0; /* Adjusted by grid/flex usually */
  opacity: 0.5;
}

.p-nav-side + .p-content {
  margin-left: 10px;
}

.layout-info h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--color-text-main);
}

.layout-info p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.check-icon {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
