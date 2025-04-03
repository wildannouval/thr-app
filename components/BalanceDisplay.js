'use client'

import { formatCurrency } from '../utils/helpers'

export default function BalanceDisplay({ amount }) {
    return (
        <p className="text-3xl font-semibold text-gray-900">
            {formatCurrency(amount)}
        </p>
    )
}