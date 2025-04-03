'use client'

import { getCategoryName, formatCurrency } from '../utils/helpers'
import { HiArrowUp, HiArrowDown } from 'react-icons/hi'

export default function TransactionList({ transactions }) {
    return (
        <div className="space-y-3">
            {transactions.map(transaction => (
                <div
                    key={transaction.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:bg-gray-50/30 transition-colors"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full mt-1 ${transaction.amount >= 0
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                                }`}>
                                {transaction.amount >= 0 ? (
                                    <HiArrowUp size={16} />
                                ) : (
                                    <HiArrowDown size={16} />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {getCategoryName(transaction.categoryId)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(transaction.date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                                {transaction.note && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        <span className="font-medium">Note:</span> {transaction.note}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className={`font-medium ${transaction.amount >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {transaction.amount >= 0 ? '+' : '-'}
                            {formatCurrency(Math.abs(transaction.amount))}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}