'use client'
import { useState, useEffect } from 'react'
import { loadData, saveData, generateId } from '../utils/storage'
import { HiPlus, HiTrash, HiPencil, HiX, HiCheck, HiArrowLeft } from 'react-icons/hi'
import { FaCircle } from 'react-icons/fa'
import CurrencyInput from '../components/CurrencyInput'
import Link from 'next/link'

const COLORS = [
    '#FF6B6B', '#FF9E4F', '#FFD166', '#06D6A0',
    '#118AB2', '#073B4C', '#7209B7', '#F72585'
]

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [transactions, setTransactions] = useState([])
    const [newCategory, setNewCategory] = useState({
        name: '',
        type: 'expense',
        budget: '',
        color: COLORS[0]
    })
    const [editCategory, setEditCategory] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [categoryTransactions, setCategoryTransactions] = useState([])
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isAddingTransaction, setIsAddingTransaction] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)

    const [transactionForm, setTransactionForm] = useState({
        type: 'income',
        categoryId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    })

    useEffect(() => {
        setCategories(loadData('categories') || [])
        setTransactions(loadData('transactions') || [])
    }, [])

    useEffect(() => {
        if (selectedCategory) {
            const filtered = transactions.filter(t => t.categoryId === selectedCategory.id)
            setCategoryTransactions(filtered)
        }
    }, [selectedCategory, transactions])

    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const calculateBudgetUsage = (categoryId) => {
        const category = categories.find(c => c.id === categoryId)
        if (!category || !category.budget) return { used: 0, remaining: 0, percentage: 0 }

        const categoryTrans = transactions.filter(t => t.categoryId === categoryId)
        const totalUsed = Math.abs(categoryTrans.reduce((sum, t) => sum + t.amount, 0))

        return {
            used: totalUsed,
            remaining: category.budget - totalUsed,
            percentage: (totalUsed / category.budget) * 100
        }
    }

    const handleAddCategory = () => {
        if (!newCategory.name) return

        const updatedCategories = [
            ...categories,
            {
                id: generateId(),
                name: newCategory.name,
                type: newCategory.type,
                budget: newCategory.budget ? Number(newCategory.budget) : null,
                color: newCategory.color
            }
        ]

        setCategories(updatedCategories)
        saveData('categories', updatedCategories)
        resetForm()
        setIsAdding(false)
    }

    const handleEditCategory = () => {
        if (!editCategory.name) return

        const updatedCategories = categories.map(cat =>
            cat.id === editCategory.id ? {
                ...editCategory,
                budget: editCategory.budget ? Number(editCategory.budget) : null
            } : cat
        )

        setCategories(updatedCategories)
        saveData('categories', updatedCategories)
        setEditCategory(null)
        setIsEditing(false)
    }

    const handleDeleteCategory = (id) => {
        const updatedCategories = categories.filter(cat => cat.id !== id)
        setCategories(updatedCategories)
        saveData('categories', updatedCategories)

        // Also delete related transactions
        const updatedTransactions = transactions.filter(t => t.categoryId !== id)
        setTransactions(updatedTransactions)
        saveData('transactions', updatedTransactions)
    }

    const handleAddTransaction = () => {
        if (!transactionForm.amount || !transactionForm.categoryId) return

        const newTransaction = {
            id: generateId(),
            categoryId: selectedCategory.id,
            amount: parseFloat(transactionForm.amount),
            date: transactionForm.date,
            note: transactionForm.note
        }

        const updatedTransactions = [...transactions, newTransaction]
        setTransactions(updatedTransactions)
        saveData('transactions', updatedTransactions)

        setTransactionForm({
            type: 'income',
            categoryId: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            note: ''
        })
        setIsAddingTransaction(false)
    }

    const handleEditTransaction = () => {
        if (!editingTransaction.amount) return

        const updatedTransactions = transactions.map(t =>
            t.id === editingTransaction.id ? editingTransaction : t
        )

        setTransactions(updatedTransactions)
        saveData('transactions', updatedTransactions)
        setEditingTransaction(null)
    }

    const handleDeleteTransaction = (id) => {
        const updatedTransactions = transactions.filter(t => t.id !== id)
        setTransactions(updatedTransactions)
        saveData('transactions', updatedTransactions)
    }

    const resetForm = () => {
        setNewCategory({
            name: '',
            type: 'expense',
            budget: '',
            color: COLORS[0]
        })
    }

    const getFilteredCategories = (type) => {
        return categories.filter(category => category.type === type)
    }

    return (
        <div className="p-6">
            {selectedCategory ? (
                <div>
                    {/* Category Transactions Header */}
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100"
                        >
                            <HiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">{selectedCategory.name}</h1>
                            {selectedCategory.budget && (
                                <p className="text-gray-500">
                                    Anggaran: {formatCurrency(selectedCategory.budget)} |
                                    Terpakai: {formatCurrency(calculateBudgetUsage(selectedCategory.id).used)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Add Transaction Button */}
                    <div className="flex justify-end mb-4">
                        <button
                            className="flex items-center justify-center bg-blue-500 text-white py-3 rounded-lg w-full relative group"
                            onClick={() => alert('Fitur tambah transaksi dari kategori akan segera hadir!')}
                        >
                            <HiPlus className="mr-1" />
                            Transaksi
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Coming Soon
                            </span>
                        </button>

                        {/* <button
                            onClick={() => setIsAddingTransaction(true)}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center"
                        >
                            <HiPlus size={20} />
                            Transaksi
                        </button> */}
                    </div>

                    {/* Add Transaction Form */}
                    {isAddingTransaction && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Transaksi Baru</h2>
                                <button
                                    onClick={() => setIsAddingTransaction(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <HiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                                    <CurrencyInput
                                        value={transactionForm.amount}
                                        onChange={(value) => setTransactionForm({ ...transactionForm, amount: value })}
                                        placeholder="1.000.000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={transactionForm.date}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={transactionForm.note}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, note: e.target.value })}
                                        placeholder="Deskripsi transaksi"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleAddTransaction}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    >
                                        <HiCheck className="mr-2" size={18} />
                                        Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Transaction Form */}
                    {editingTransaction && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Edit Transaksi</h2>
                                <button
                                    onClick={() => setEditingTransaction(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <HiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                                    <CurrencyInput
                                        value={Math.abs(editingTransaction.amount)}
                                        onChange={(value) => {
                                            const amount = parseFloat(value) || 0
                                            const currentSign = Math.sign(editingTransaction.amount)
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                amount: currentSign * amount
                                            })
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTransaction.date}
                                        onChange={(e) => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTransaction.note || ''}
                                        onChange={(e) => setEditingTransaction({ ...editingTransaction, note: e.target.value })}
                                        placeholder="Deskripsi transaksi"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleEditTransaction}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    >
                                        <HiCheck className="mr-2" size={18} />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transactions List */}
                    <div className="space-y-3">
                        {categoryTransactions.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 text-center">
                                <p className="text-gray-500">Belum ada transaksi untuk kategori ini</p>
                            </div>
                        ) : (
                            categoryTransactions.map(transaction => (
                                <div
                                    key={transaction.id}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 hover:bg-gray-50/30 transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {new Date(transaction.date).toLocaleDateString('id-ID')}
                                            </p>
                                            <p className={`${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                            {transaction.note && (
                                                <p className="text-gray-500 text-sm mt-1">{transaction.note}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-2">
                                            <button
                                                onClick={() => {
                                                    alert('Fitur edit transaksi dari kategori akan segera hadir!');
                                                    // setEditingTransaction(transaction) // Comment dulu
                                                }}
                                                className="p-2 text-gray-500 hover:text-blue-500 relative group"
                                            >
                                                <HiPencil size={18} />
                                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Coming Soon
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    alert('Fitur hapus transaksi dari kategori akan segera hadir!');
                                                    // handleDeleteTransaction(transaction.id) // Comment dulu
                                                }}
                                                className="p-2 text-gray-500 hover:text-red-500 relative group"
                                            >
                                                <HiTrash size={18} />
                                                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Coming Soon
                                                </span>
                                            </button>
                                        </div>
                                        {/* <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingTransaction(transaction)}
                                                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                                            >
                                                <HiPencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTransaction(transaction.id)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                            >
                                                <HiTrash size={18} />
                                            </button>
                                        </div> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Categories Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Kategori</h1>
                        <button
                            onClick={() => {
                                setIsAdding(true)
                                setIsEditing(false)
                                resetForm()
                            }}
                            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        >
                            <HiPlus size={20} />
                        </button>
                    </div>

                    {/* Add Category Form */}
                    {isAdding && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Tambah Kategori Baru</h2>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <HiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="Makanan"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kategori</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={newCategory.type}
                                        onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                                    >
                                        <option value="expense">Pengeluaran</option>
                                        <option value="income">Pemasukan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Anggaran (Opsional)</label>
                                    <CurrencyInput
                                        value={newCategory.budget}
                                        onChange={(value) => setNewCategory({ ...newCategory, budget: value })}
                                        placeholder="1.000.000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewCategory({ ...newCategory, color })}
                                                className={`p-1 rounded-full ${newCategory.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                            >
                                                <FaCircle size={24} color={color} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleAddCategory}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    >
                                        <HiCheck className="mr-2" size={18} />
                                        Tambah Kategori
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Category Form */}
                    {isEditing && editCategory && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Edit Kategori</h2>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <HiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editCategory.name}
                                        onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kategori</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editCategory.type}
                                        onChange={(e) => setEditCategory({ ...editCategory, type: e.target.value })}
                                    >
                                        <option value="expense">Pengeluaran</option>
                                        <option value="income">Pemasukan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Anggaran (Opsional)</label>
                                    <CurrencyInput
                                        value={editCategory.budget || ''}
                                        onChange={(value) => setEditCategory({ ...editCategory, budget: value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setEditCategory({ ...editCategory, color })}
                                                className={`p-1 rounded-full ${editCategory.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                            >
                                                <FaCircle size={24} color={color} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleEditCategory}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    >
                                        <HiCheck className="mr-2" size={18} />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories List */}
                    <div className="space-y-3">
                        {categories.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 text-center">
                                <p className="text-gray-500">Belum ada kategori</p>
                            </div>
                        ) : (
                            categories.map(category => {
                                const budgetUsage = calculateBudgetUsage(category.id)
                                return (
                                    <div
                                        key={category.id}
                                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4 hover:bg-gray-50/30 transition-colors"
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <FaCircle color={category.color} />
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full ${category.type === 'income'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                        </span>
                                                        {category.budget && (
                                                            <span className="text-xs text-gray-500">
                                                                {formatCurrency(category.budget)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditCategory(category)
                                                        setIsEditing(true)
                                                        setIsAdding(false)
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors"
                                                >
                                                    <HiPencil size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteCategory(category.id)
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                                >
                                                    <HiTrash size={18} />
                                                </button>
                                                <button className="p-2 text-gray-400">
                                                    <HiArrowLeft size={18} className="transform rotate-180" />
                                                </button>
                                            </div>
                                        </div>

                                        {category.budget && (
                                            <div className="mt-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${category.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${Math.min(budgetUsage.percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <span>Terpakai: {formatCurrency(budgetUsage.used)}</span>
                                                    <span>Sisa: {formatCurrency(budgetUsage.remaining)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}