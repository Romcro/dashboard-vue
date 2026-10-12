import { createRouter, createWebHashHistory } from 'vue-router'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'
import { auth, DEMO } from './firebase'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        beforeEnter: () => (DEMO ? '/' : true)
    },
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/map',
        name: 'Map',
        component: () => import('./views/Map.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('./views/Settings.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// Authentication Guard with Firebase
router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    if (requiresAuth) {
        // Wait for auth to init if needed
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            next('/login')
        } else {
            next()
        }
    } else {
        next()
    }
})

// Helper to wait for Firebase Auth to initialize
function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe()
            resolve(user)
        }, reject)
    })
}

export default router
