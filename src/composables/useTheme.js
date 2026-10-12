import { ref, onMounted } from 'vue'

const isDark = ref(false)
const layoutMode = ref('top')

// Initialize layout immediately (module scope)
const savedLayout = localStorage.getItem('layoutMode')
if (savedLayout) {
    layoutMode.value = savedLayout
}

export function useTheme() {
    const toggleTheme = () => {
        isDark.value = !isDark.value
        updateThemeEnv()
    }

    const setDark = (val) => {
        isDark.value = val
        updateThemeEnv()
    }

    const setLayout = (mode) => {
        layoutMode.value = mode
        localStorage.setItem('layoutMode', mode)
    }

    const updateThemeEnv = () => {
        const theme = isDark.value ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme')
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            isDark.value = true
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            isDark.value = false
            document.documentElement.setAttribute('data-theme', 'light')
        }
    }

    return {
        isDark,
        toggleTheme,
        initTheme,
        layoutMode,
        setLayout
    }
}
