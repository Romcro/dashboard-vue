<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase'
import { 
  signInWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const configMissing = ref(false)
const router = useRouter()

onMounted(() => {
    // Check if auth is a mock object
    if (!auth.app && !auth.currentUser) {
       if (!import.meta.env.VITE_FIREBASE_API_KEY) {
           configMissing.value = true
           error.value = "⚠️ Configuration Firebase manquante dans .env"
       }
    }
})

const handleLogin = async () => {
  if (configMissing.value) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    // Ensure persistence is set to LOCAL (default, but explicit is safer)
    // This keeps the user logged in even after browser close/tab close
    await setPersistence(auth, browserLocalPersistence)

    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    
    console.log("Login successful:", userCredential.user.email)
    
    // We do NOT manually set token in localStorage anymore for API consumption
    // api.js handles getting the fresh token from auth.currentUser
    
    router.push('/')
    
  } catch (e) {
    console.error('Login error', e)
    if (e.code === 'auth/invalid-credential') {
        error.value = 'Email ou mot de passe incorrect'
    } else if (e.message.includes("Firebase config missing")) {
        error.value = "Configuration Firebase manquante"
    } else {
        error.value = 'Erreur de connexion'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card glass-panel">
      <div class="brand">
        <h2>Good<span class="highlight">forest</span></h2>
        <p>Premium Forest Monitoring</p>
      </div>
      
      <div v-if="configMissing" class="config-alert">
        <h3>Configuration Requise</h3>
        <p>Veuillez configurer les clés Firebase dans le fichier <code>.env</code></p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email" 
            placeholder="vous@exemple.fr"
            required
            class="input-field"
            :disabled="configMissing"
          />
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="password" 
            placeholder="••••••••"
            required
            class="input-field"
            :disabled="configMissing"
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn btn-primary full-width" :disabled="isLoading || configMissing">
          <span v-if="isLoading">Connexion...</span>
          <span v-else>Se connecter</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #1e293b, #0f172a);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.05);
}

.brand {
  text-align: center;
  margin-bottom: 2rem;
}
.brand h2 {
  font-size: 2rem;
  color: white;
}
.brand p {
  color: #94a3b8;
}
.highlight {
  color: var(--color-primary);
}

.config-alert {
  background: rgba(255, 149, 0, 0.1);
  border: 1px solid var(--color-status-risk);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.config-alert h3 {
  color: var(--color-status-risk);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.config-alert p {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  color: #cbd5e1;
  font-size: 0.875rem;
}

.input-field {
  padding: 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus {
  border-color: var(--color-primary);
}
.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
}
.full-width:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-msg {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
}
</style>
