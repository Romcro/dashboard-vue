import axios from 'axios'
import { format } from 'date-fns'

const WEATHER_API_URL = 'https://archive-api.open-meteo.com/v1/archive'

// Helper to interpret WMO codes
const getWeatherCondition = (code) => {
    if ([0, 1].includes(code)) return 'Ensoleillé'
    if ([2, 3].includes(code)) return 'Nuageux'
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Pluvieux'
    if ([95, 96, 99].includes(code)) return 'Orageux'
    return 'Variable'
}

export default {
    async fetchWeatherData(lat, lon, startDate, endDate) {
        try {
            const startStr = format(startDate, 'yyyy-MM-dd')
            const endStr = format(endDate, 'yyyy-MM-dd')

            console.log(`[WeatherAPI] Fetching for ${lat}, ${lon} from ${startStr} to ${endStr}`)

            const response = await axios.get(WEATHER_API_URL, {
                params: {
                    latitude: lat,
                    longitude: lon,
                    start_date: startStr,
                    end_date: endStr,
                    daily: 'temperature_2m_mean,precipitation_sum,weather_code',
                    timezone: 'Europe/Paris'
                }
            })

            const daily = response.data.daily

            if (!daily || !daily.time) return null

            // Calculate averages/sums locally
            const temps = daily.temperature_2m_mean
            const precips = daily.precipitation_sum
            const codes = daily.weather_code

            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length
            const totalPrecip = precips.reduce((a, b) => a + b, 0)

            // Find mode of weather codes
            const frequency = {}
            let maxFreq = 0
            let modeCode = codes[0]

            for (const code of codes) {
                frequency[code] = (frequency[code] || 0) + 1
                if (frequency[code] > maxFreq) {
                    maxFreq = frequency[code]
                    modeCode = code
                }
            }

            return {
                avgTemp: avgTemp,
                totalPrecip: totalPrecip,
                condition: getWeatherCondition(modeCode)
            }

        } catch (error) {
            console.error('Weather API Error:', error)
            return null
        }
    }
}
