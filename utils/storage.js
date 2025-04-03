// Save to localStorage
export const saveData = (key, data) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data))
    }
}

// Load from localStorage - return empty array if no data found
export const loadData = (key) => {
    if (typeof window !== 'undefined') {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : []
    }
    return []
}

// Generate ID
export const generateId = () => Date.now()