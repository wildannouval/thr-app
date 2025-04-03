import { loadData } from "./storage"

// Format currency (IDR) with improved formatting options
export const formatCurrency = (amount, omitDecimals = false) => {
    if (isNaN(amount)) return 'Rp0'

    // Fallback untuk SSR
    if (typeof window === 'undefined') {
        const formatted = amount?.toLocaleString('id-ID') || '0'
        return `Rp ${formatted}${omitDecimals ? '' : ',00'}`
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: omitDecimals ? 0 : 2,
        maximumFractionDigits: omitDecimals ? 0 : 2
    }).format(amount).replace('Rp', 'Rp ')
}

// Parse formatted number string to number
export const parseFormattedNumber = (str) => {
    if (typeof str === 'number') return str

    // Remove all non-digit characters except decimal point
    const numStr = String(str).replace(/[^\d.,]/g, '')
        .replace(/\./g, '') // Remove thousand separators
        .replace(/,/g, '.') // Convert decimal comma to point

    return parseFloat(numStr) || 0
}

    // Get wallet name by ID with improved unknown handling
    export const getWalletName = (id) => {
        try {
            const wallets = loadData('wallets') || []
            const wallet = wallets.find(w => w.id === id)
            return wallet ? wallet.name : 'Dompet Tidak Dikenal'
        } catch {
            return 'Dompet Tidak Dikenal'
        }
    }

// Get category name by ID with transfer handling
export const getCategoryName = (id) => {
    try {
        if (id === null || id === undefined) return 'Transfer'

        const categories = loadData('categories') || []
        const category = categories.find(c => c.id === id)
        return category ? category.name : 'Kategori Tidak Dikenal'
    } catch {
        return 'Kategori Tidak Dikenal'
    }
}

// Additional helper to format date if needed
export const formatDate = (dateString) => {
    if (!dateString) return ''

    const options = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }

    return new Date(dateString).toLocaleDateString('id-ID', options)
}

// Calculate total expenses excluding transfers
export const calculateExpenses = (transactions) => {
    return transactions
        .filter(t => t.amount < 0 && t.categoryId !== null) // Exclude transfers
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
}

// Calculate total income excluding transfers
export const calculateIncome = (transactions) => {
    return transactions
        .filter(t => t.amount > 0 && t.categoryId !== null) // Exclude transfers
        .reduce((sum, t) => sum + t.amount, 0)
}

// Calculate transfer amounts
export const calculateTransfers = (transactions) => {
    const outgoing = transactions
        .filter(t => t.amount < 0 && t.categoryId === null)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const incoming = transactions
        .filter(t => t.amount > 0 && t.categoryId === null)
        .reduce((sum, t) => sum + t.amount, 0)

    return { outgoing, incoming }
}