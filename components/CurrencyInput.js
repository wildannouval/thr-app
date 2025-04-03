'use client'
import { useState, useEffect } from 'react'


export default function CurrencyInput({ value, onChange, placeholder }) {
    
    const parseCurrency = (displayValue) => {
        const num = parseInt(displayValue.replace(/\./g, ''), 10)
        return isNaN(num) ? '' : num
    }
    
    const [displayValue, setDisplayValue] = useState('')

    useEffect(() => {
        // Format initial value
        if (value !== '' && value !== undefined && value !== null) {
            setDisplayValue(formatToIDR(value.toString()))
        }
    }, [value])

    const formatToIDR = (numStr) => {
        return numStr.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }

    const handleChange = (e) => {
        const formatted = formatToIDR(e.target.value)
        setDisplayValue(formatted)
        onChange(parseCurrency(formatted))
    }

    // const handleChange = (e) => {
    //     const rawValue = e.target.value.replace(/\./g, '')
    //     setDisplayValue(formatToIDR(rawValue))
    //     onChange(rawValue === '' ? '' : Number(rawValue))
    // }

    return (
        <input
            type="text"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder || "0"}
        />
    )
}