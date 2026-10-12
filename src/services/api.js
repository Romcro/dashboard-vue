import axios from 'axios'
import { auth, DEMO } from '../firebase'
import { demoData } from '../demo/demoData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000
})

// Add Auth Token from Firebase
api.interceptors.request.use(async config => {
    // Only if auth is initialized and user is logged in
    if (auth.currentUser) {
        // getIdToken(false) returns current token if valid, or refreshes it if expired
        // This handles "30 day session" effectively via token refresh
        try {
            const token = await auth.currentUser.getIdToken()
            config.headers.Authorization = `Bearer ${token}`
        } catch (e) {
            console.warn("Failed to get fresh token", e)
        }
    }
    return config
})

// Handle 401: If despite refresh we get 401, redirect to login
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Only redirect if we are sure it's an auth failure that cannot be recovered
            // Trigger logout to clean state
            if (auth.signOut) auth.signOut()
            window.location.hash = '#/login'
        }
        return Promise.reject(error)
    }
)

// In demo mode, answer with the fictional dataset as if it came from the API
const demo = key => new Promise(resolve => setTimeout(() => resolve({ data: demoData[key] }), 250))

export default {
    // Real API Calls
    async fetchForests() {
        if (DEMO) return demo('forests')
        return api.get('/forests')
    },

    async fetchPlots() {
        if (DEMO) return demo('plots')
        return api.get('/plots')
    },

    async fetchEvents() {
        if (DEMO) return demo('events')
        return api.get('/events')
    },

    async fetchSpecies() {
        if (DEMO) return demo('species')
        return api.get('/species')
    }
}
