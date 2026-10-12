import { startOfMonth, endOfMonth, subMonths, getDate, endOfDay } from 'date-fns'

/**
 * Calculates the start and end dates for "Current Analysis" and "Previous Analysis"
 * periods based on the logic from the original Streamlit app.
 * 
 * Logic:
 * - If today <= 15th:
 *   - Current: 1st to 15th of current month (OR 16th-End of previous month if strictly copying python logic which seemed to handle mid-month checks. The python code says: if day <= 15: start = 1st, end = 15th)
 *   - Previous: 16th to End of previous month
 * - If today > 15th:
 *   - Current: 16th to End of current month
 *   - Previous: 1st to 15th of current month
 */
export function calculatePeriodDates() {
    const today = new Date()
    const currentDay = getDate(today)
    const currentMonth = today.getMonth() // 0-indexed
    const currentYear = today.getFullYear()

    let currentStart, currentEnd
    let previousStart, previousEnd

    if (currentDay <= 15) {
        // Current: 1st - 15th of this month
        currentStart = new Date(currentYear, currentMonth, 1) // 00:00:00
        currentEnd = endOfDay(new Date(currentYear, currentMonth, 15)) // 23:59:59

        // Previous: 16th - End of previous month
        const lastMonthDate = subMonths(today, 1)
        previousStart = new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth(), 16)
        previousEnd = endOfMonth(lastMonthDate)
    } else {
        // Current: 16th - End of this month
        currentStart = new Date(currentYear, currentMonth, 16)
        currentEnd = endOfMonth(today)

        // Previous: 1st - 15th of this month
        previousStart = new Date(currentYear, currentMonth, 1)
        previousEnd = endOfDay(new Date(currentYear, currentMonth, 15))
    }

    return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd
    }
}
