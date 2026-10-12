import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
    console.error("Global Vue Error:", err, info)
    showErrorOnScreen(err)
}

window.onerror = (message, source, lineno, colno, error) => {
    console.error("Global Window Error:", message)
    showErrorOnScreen(error || message)
}

window.onunhandledrejection = (event) => {
    console.error("Unhandled Promise Rejection:", event.reason)
    showErrorOnScreen(event.reason)
}

function showErrorOnScreen(error) {
    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.top = '0'
    el.style.left = '0'
    el.style.width = '100%'
    el.style.backgroundColor = 'red'
    el.style.color = 'white'
    el.style.padding = '1rem'
    el.style.zIndex = '99999'
    el.style.whiteSpace = 'pre-wrap'
    el.innerText = 'CRITICAL ERROR: ' + (error?.stack || error?.message || error)
    document.body.appendChild(el)
}

app.use(router).mount('#app')
