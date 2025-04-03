import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { loadData, saveData, generateId } from '../utils/storage'
import { formatCurrency, parseFormattedNumber } from '../utils/helpers'
import {
    HiPlus,
    HiTrash,
    HiPencil,
    HiX,
    HiCheck,
    HiArrowLeft,
    HiArrowRight,
    HiCreditCard,
    HiCash,
    HiArrowDown,
    HiArrowUp,
    HiDatabase
} from 'react-icons/hi'
import CurrencyInput from '@/components/CurrencyInput'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Wallet type options with icons
const WALLET_TYPES = [
    { id: 'cash', name: 'Uang Tunai', icon: <HiCash className="text-yellow-500" /> },
    { id: 'bank', name: 'Rekening Bank/Kartu', icon: <HiCreditCard className="text-blue-500" /> },
    { id: 'ewallet', name: 'E-Wallet', icon: <HiDatabase className="text-green-500" /> }
]

export default function Wallets() {
    const router = useRouter()
    const [wallets, setWallets] = useState([])
    const [transactions, setTransactions] = useState([])
    const [categories, setCategories] = useState([])
    const [newWallet, setNewWallet] = useState({
        name: '',
        balance: '',
        type: 'cash' // Default to cash
    })
    const [editWallet, setEditWallet] = useState(null)
    const [isAdding, setIsAdding] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedWallet, setSelectedWallet] = useState(null)
    const [walletTransactions, setWalletTransactions] = useState([])
    const [isAddingTransaction, setIsAddingTransaction] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)

    useEffect(() => {
        setWallets(loadData('wallets') || [])
        setTransactions(loadData('transactions') || [])
        setCategories(loadData('categories') || [])
    }, [])

    useEffect(() => {
        if (selectedWallet) {
            const filtered = transactions.filter(t => t.walletId === selectedWallet.id)
            setWalletTransactions(filtered)
        }
    }, [selectedWallet, transactions])

    const handleAddWallet = () => {
        if (!newWallet.name || !newWallet.balance) {
            toast.error('Nama dan saldo awal harus diisi')
            return
        }

        const updatedWallets = [
            ...wallets,
            {
                id: generateId(),
                name: newWallet.name,
                balance: Number(newWallet.balance),
                type: newWallet.type
            }
        ]

        setWallets(updatedWallets)
        saveData('wallets', updatedWallets)
        setNewWallet({ name: '', balance: '', type: 'cash' })
        setIsAdding(false)
        toast.success('Dompet berhasil ditambahkan')
    }

    const handleEditWallet = () => {
        if (!editWallet.name) {
            toast.error('Nama dompet harus diisi')
            return
        }

        const updatedWallet = {
            ...editWallet,
            balance: editWallet.balance === '' ? 0 : Number(editWallet.balance)
        }

        const updatedWallets = wallets.map(wallet =>
            wallet.id === updatedWallet.id ? updatedWallet : wallet
        )

        setWallets(updatedWallets)
        saveData('wallets', updatedWallets)
        setEditWallet(null)
        setIsEditing(false)
        toast.success('Dompet berhasil diperbarui')
    }

    const handleDeleteWallet = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus dompet ini? Semua transaksi terkait juga akan dihapus.')) {
            const updatedWallets = wallets.filter(wallet => wallet.id !== id)
            setWallets(updatedWallets)
            saveData('wallets', updatedWallets)

            // Also delete related transactions
            const updatedTransactions = transactions.filter(t => t.walletId !== id)
            setTransactions(updatedTransactions)
            saveData('transactions', updatedTransactions)

            toast.success('Dompet berhasil dihapus')
        }
    }

    const handleAddTransaction = () => {
        if (!transactionForm.amount || !transactionForm.categoryId) {
            toast.error('Jumlah dan kategori harus diisi')
            return
        }

        const category = categories.find(c => c.id === parseInt(transactionForm.categoryId));
        const isExpense = category?.type === 'expense';

        const amount = parseFloat(transactionForm.amount) || 0;
        const signedAmount = isExpense ? -amount : amount;

        const newTransaction = {
            id: generateId(),
            walletId: selectedWallet.id,
            categoryId: parseInt(transactionForm.categoryId),
            amount: signedAmount,
            date: transactionForm.date,
            note: transactionForm.note
        }

        // Update wallet balance
        const updatedWallets = wallets.map(wallet => {
            if (wallet.id === selectedWallet.id) {
                return {
                    ...wallet,
                    balance: wallet.balance + newTransaction.amount
                }
            }
            return wallet
        })

        const updatedTransactions = [...transactions, newTransaction]

        setWallets(updatedWallets)
        setTransactions(updatedTransactions)
        saveData('wallets', updatedWallets)
        saveData('transactions', updatedTransactions)

        setTransactionForm({
            type: 'income',
            categoryId: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            note: ''
        })
        setIsAddingTransaction(false)
        toast.success('Transaksi berhasil ditambahkan')
    }

    const handleEditTransaction = () => {
        if (!editingTransaction.amount || !editingTransaction.categoryId) {
            toast.error('Jumlah dan kategori harus diisi')
            return
        }

        const originalTransaction = transactions.find(t => t.id === editingTransaction.id)
        if (!originalTransaction) return

        const balanceChange = editingTransaction.amount - originalTransaction.amount

        const updatedWallets = wallets.map(wallet => {
            if (wallet.id === editingTransaction.walletId) {
                return {
                    ...wallet,
                    balance: wallet.balance + balanceChange
                }
            }
            return wallet
        })

        const updatedTransactions = transactions.map(t =>
            t.id === editingTransaction.id ? editingTransaction : t
        )

        setWallets(updatedWallets)
        setTransactions(updatedTransactions)
        saveData('wallets', updatedWallets)
        saveData('transactions', updatedTransactions)

        setEditingTransaction(null)
        toast.success('Transaksi berhasil diperbarui')
    }

    const handleDeleteTransaction = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            const transactionToDelete = transactions.find(t => t.id === id)

            const updatedWallets = wallets.map(wallet => {
                if (wallet.id === transactionToDelete.walletId) {
                    return {
                        ...wallet,
                        balance: wallet.balance - transactionToDelete.amount
                    }
                }
                return wallet
            })

            const updatedTransactions = transactions.filter(t => t.id !== id)

            setWallets(updatedWallets)
            setTransactions(updatedTransactions)
            saveData('wallets', updatedWallets)
            saveData('transactions', updatedTransactions)

            toast.success('Transaksi berhasil dihapus')
        }
    }

    const getCategoryName = (id) => {
        if (id === null) return 'Transfer'
        const category = categories.find(c => c.id === id)
        return category ? category.name : 'Unknown Category'
    }

    const [transactionForm, setTransactionForm] = useState({
        type: 'income',
        categoryId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: ''
    })

    const getFilteredCategories = (type) => {
        return categories.filter(category => category.type === type)
    }

    const getWalletIcon = (type) => {
        const walletType = WALLET_TYPES.find(t => t.id === type)
        return walletType ? walletType.icon : <HiDatabase />
    }

    return (
        <div className="p-6">
            <ToastContainer position="bottom-right" autoClose={3000} />

            {selectedWallet ? (
                <div>
                    {/* Wallet Transactions Header */}
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => setSelectedWallet(null)}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <HiArrowLeft size={20} />
                        </button>
                        <div className="flex items-center">
                            <div className="p-2 rounded-full bg-gray-100 mr-3">
                                {getWalletIcon(selectedWallet.type)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">{selectedWallet.name}</h1>
                                <p className="text-gray-500">{formatCurrency(selectedWallet.balance)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Add Transaction Button */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setIsAddingTransaction(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                            <HiPlus className="mr-2" size={18} />
                            <span>Transaksi</span>
                        </button>
                    </div>

                    {/* Add Transaction Form */}
                    {isAddingTransaction && (
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Transaksi Baru</h2>
                                <button
                                    onClick={() => setIsAddingTransaction(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    <HiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={transactionForm.type}
                                        onChange={(e) => setTransactionForm({
                                            ...transactionForm,
                                            type: e.target.value,
                                            categoryId: ''
                                        })}
                                    >
                                        <option value="income">Pemasukan</option>
                                        <option value="expense">Pengeluaran</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={transactionForm.categoryId}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, categoryId: e.target.value })}
                                        required
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {getFilteredCategories(transactionForm.type).map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>

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
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={transactionForm.date}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={transactionForm.note}
                                        onChange={(e) => setTransactionForm({ ...transactionForm, note: e.target.value })}
                                        placeholder="Deskripsi transaksi"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleAddTransaction}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
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
                                {/* Tambahkan pilihan jenis transaksi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTransaction.amount >= 0 ? 'income' : 'expense'}
                                        onChange={(e) => {
                                            const amount = Math.abs(editingTransaction.amount);
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                amount: e.target.value === 'income' ? amount : -amount
                                            });
                                        }}
                                    >
                                        <option value="income">Pemasukan</option>
                                        <option value="expense">Pengeluaran</option>
                                    </select>
                                </div>
                                {/* Modifikasi pilihan kategori */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTransaction.categoryId}
                                        onChange={(e) => setEditingTransaction({
                                            ...editingTransaction,
                                            categoryId: parseInt(e.target.value)
                                        })}
                                        required
                                    >
                                        {getFilteredCategories(editingTransaction.amount >= 0 ? 'income' : 'expense')
                                            .map(category => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>

                                {/* Tambahkan pilihan jenis transaksi */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                                    <select
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingTransaction.amount >= 0 ? 'income' : 'expense'}
                                        onChange={(e) => {
                                            const amount = Math.abs(editingTransaction.amount);
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                amount: e.target.value === 'income' ? amount : -amount
                                            });
                                        }}
                                    >
                                        <option value="income">Pemasukan</option>
                                        <option value="expense">Pengeluaran</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                                    <CurrencyInput
                                        value={Math.abs(editingTransaction.amount)}
                                        onChange={(value) => {
                                            const amount = parseFloat(value) || 0;
                                            // Pertahankan tanda (negatif/positif) yang sudah ada
                                            const currentSign = Math.sign(editingTransaction.amount);
                                            setEditingTransaction({
                                                ...editingTransaction,
                                                amount: currentSign * amount
                                            });
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
                                        value={editingTransaction.note}
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
                        {walletTransactions.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                <p className="text-gray-500">Belum ada transaksi untuk dompet ini</p>
                            </div>
                        ) : (
                            walletTransactions.map(transaction => (
                                <div
                                    key={transaction.id}
                                    className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setEditingTransaction(transaction)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-full mr-3 ${transaction.amount < 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                                                    }`}>
                                                    {transaction.amount < 0 ? <HiArrowDown /> : <HiArrowUp />}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {getCategoryName(transaction.categoryId)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(transaction.date).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            {transaction.note && (
                                                <p className="text-gray-500 text-sm mt-1 ml-11">{transaction.note}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <p className={`font-medium ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'
                                                }`}>
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditingTransaction(transaction)
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                                                >
                                                    <HiPencil size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteTransaction(transaction.id)
                                                    }}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                                >
                                                    <HiTrash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Wallets Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">Dompet Saya</h1>
                        <button
                            onClick={() => {
                                setIsAdding(true)
                                setIsEditing(false)
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                        >
                            <HiPlus size={20} />
                        </button>
                    </div>

                    {/* Add Wallet Form */}
                    {isAdding && (
                        <>
                            <div
                                className="fixed inset-0 bg-black/30 z-40"
                                onClick={() => setIsAdding(false)}
                            />
                            <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6 animate-fade-in z-50 relative">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-lg font-semibold">Dompet Baru</h2>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsAdding(false);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 transition-colors"
                                        >
                                            <HiX size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dompet</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                value={newWallet.name}
                                                onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                                                placeholder="Dompet Utama"
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dompet</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {WALLET_TYPES.map(type => (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        className={`p-3 rounded-lg border transition-colors flex flex-col items-center ${newWallet.type === type.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-300 hover:border-blue-300'
                                                            }`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setNewWallet({ ...newWallet, type: type.id });
                                                        }}
                                                    >
                                                        <span className="mb-1">{type.icon}</span>
                                                        <span className="text-sm">{type.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Awal</label>
                                            <CurrencyInput
                                                value={newWallet.balance}
                                                onChange={(value) => setNewWallet({ ...newWallet, balance: value })}
                                                placeholder="1.000.000"
                                            />
                                        </div>

                                        <div className="flex space-x-3 pt-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddWallet();
                                                }}
                                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                                            >
                                                <HiCheck className="mr-2" size={18} />
                                                Simpan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>

                    )}

                    {/* Edit Wallet Form */}
                    {isEditing && editWallet && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Edit Dompet</h2>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <HiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dompet</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editWallet.name}
                                        onChange={(e) => setEditWallet({ ...editWallet, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Saldo</label>
                                    <CurrencyInput
                                        value={editWallet?.balance || ''}
                                        onChange={(value) => setEditWallet({ ...editWallet, balance: value })}
                                    />
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <button
                                        onClick={handleEditWallet}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    >
                                        <HiCheck className="mr-2" size={18} />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Wallets List */}
                    <div className="space-y-4">
                        {wallets.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-md p-6 text-center">
                                <p className="text-gray-500">Belum ada dompet</p>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Tambah Dompet Pertama
                                </button>
                            </div>
                        ) : (
                            wallets.map(wallet => (
                                <div
                                    key={wallet.id}
                                    className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedWallet(wallet)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-gray-100 mr-3">
                                                {getWalletIcon(wallet.type)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{wallet.name}</h3>
                                                <p className="text-gray-600">{formatCurrency(wallet.balance)}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditWallet(wallet)
                                                    setIsEditing(true)
                                                    setIsAdding(false)
                                                }}
                                                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                                            >
                                                <HiPencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteWallet(wallet.id)
                                                }}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                            >
                                                <HiTrash size={18} />
                                            </button>
                                            <HiArrowRight className="text-gray-400" size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}