'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { HiArrowUp, HiArrowDown, HiCurrencyDollar } from 'react-icons/hi'
import { loadData } from '../utils/storage'

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF2D55', '#AF52DE'] // Apple color palette

export default function Statistics() {
    const [isClient, setIsClient] = useState(false)
    const [data, setData] = useState({
        categoryData: [],
        monthlyData: [],
        totals: { income: 0, expense: 0 }
    })

    useEffect(() => {
        setIsClient(true)
        loadStatisticsData()
    }, [])

    const loadStatisticsData = () => {
        // Load data from localStorage
        const transactions = loadData('transactions') || []
        const categories = loadData('categories') || []

        // Calculate totals
        const totals = transactions.reduce((acc, transaction) => {
            if (transaction.amount > 0) {
                acc.income += transaction.amount
            } else {
                acc.expense += Math.abs(transaction.amount)
            }
            return acc
        }, { income: 0, expense: 0 })

        // Group by category
        const categoryMap = {}
        transactions.forEach(transaction => {
            if (transaction.amount < 0) { // Only expenses for pie chart
                const amount = Math.abs(transaction.amount)
                if (!categoryMap[transaction.categoryId]) {
                    categoryMap[transaction.categoryId] = amount
                } else {
                    categoryMap[transaction.categoryId] += amount
                }
            }
        })

        // Prepare category data for pie chart
        const categoryData = Object.entries(categoryMap).map(([categoryId, value]) => {
            const category = categories.find(c => c.id === parseInt(categoryId))
            return {
                name: category?.name || 'Unknown',
                value,
                color: category?.color || COLORS[Math.floor(Math.random() * COLORS.length)]
            }
        })

        // Group by month
        const monthlyMap = {}
        transactions.forEach(transaction => {
            const date = new Date(transaction.date)
            const monthYear = `${date.getFullYear()}-${date.getMonth()}`
            
            if (!monthlyMap[monthYear]) {
                monthlyMap[monthYear] = { income: 0, expense: 0 }
            }
            
            if (transaction.amount > 0) {
                monthlyMap[monthYear].income += transaction.amount
            } else {
                monthlyMap[monthYear].expense += Math.abs(transaction.amount)
            }
        })

        // Prepare monthly data for bar chart
        const monthlyData = Object.entries(monthlyMap).map(([monthYear, values]) => {
            const [year, month] = monthYear.split('-')
            return {
                name: new Date(parseInt(year), parseInt(month)).toLocaleString('id-ID', { month: 'short' }),
                income: values.income,
                expense: values.expense
            }
        }).sort((a, b) => {
            // Sort by year and month
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
            return months.indexOf(a.name) - months.indexOf(b.name)
        })

        setData({
            categoryData,
            monthlyData,
            totals
        })
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    if (!isClient) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-gray-100/50 rounded-2xl p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-24 bg-gray-200 rounded-xl"></div>
                            <div className="h-24 bg-gray-200 rounded-xl"></div>
                        </div>
                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Statistik Keuangan</h1>
                <div className="flex items-center space-x-1 text-gray-500">
                    <HiCurrencyDollar />
                    <span className="text-sm">IDR</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/50">
                    <div className="flex items-center space-x-2 text-green-500 mb-2">
                        <HiArrowUp className="text-lg" />
                        <span className="text-sm font-medium">Pemasukan</span>
                    </div>
                    <p className="text-2xl font-semibold">{formatCurrency(data.totals.income)}</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/50">
                    <div className="flex items-center space-x-2 text-red-500 mb-2">
                        <HiArrowDown className="text-lg" />
                        <span className="text-sm font-medium">Pengeluaran</span>
                    </div>
                    <p className="text-2xl font-semibold">{formatCurrency(data.totals.expense)}</p>
                </div>
            </div>

            {/* Pengeluaran per Kategori */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Pengeluaran</h2>
                {data.categoryData.length > 0 ? (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {data.categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        Tidak ada data pengeluaran
                    </div>
                )}
            </div>

            {/* Transaksi Bulanan */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200/50">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Bulanan</h2>
                {data.monthlyData.length > 0 ? (
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.monthlyData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tickFormatter={(value) => formatCurrency(value).replace('Rp', '')}
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(label) => `Bulan: ${label}`}
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="income"
                                    fill={COLORS[0]}
                                    name="Pemasukan"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="expense"
                                    fill={COLORS[3]}
                                    name="Pengeluaran"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        Tidak ada data transaksi bulanan
                    </div>
                )}
            </div>
        </div>
    )
}