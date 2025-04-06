import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { formatCurrency, parseFormattedNumber, getWalletName, getCategoryName } from '../utils/helpers'
import { loadData, saveData, generateId } from '../utils/storage'
import { HiArrowUp, HiArrowDown, HiPlus, HiArrowRight, HiX, HiCheck, HiCash, HiCreditCard, HiDatabase, HiSearch } from 'react-icons/hi'

// Client-side only components
const TransactionList = dynamic(() => import('../components/TransactionList'), {
  ssr: false,
  loading: () => (
    <div className="p-4">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
})

const BalanceDisplay = dynamic(() => import('../components/BalanceDisplay'), {
  ssr: false,
  loading: () => (
    <div className="h-10 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
  )
})

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[250px] z-50 animate-slide-up`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <HiCheck className="mr-2" size={20} />
        ) : (
          <HiX className="mr-2" size={20} />
        )}
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <HiX size={18} />
      </button>
    </div>
  )
}

export default function Home() {
  const [wallets, setWallets] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [activeTab, setActiveTab] = useState('expense') // 'expense' or 'income'
  const [toast, setToast] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    walletId: '',
    categoryId: '',
    amount: '',
    formattedAmount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    fromWalletId: '',
    toWalletId: '',
    amount: '',
    formattedAmount: '',
    note: ''
  })

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Calculate expense and income totals excluding transfers
  const expenseTotal = transactions
    .filter(t => t.amount < 0 && t.categoryId !== null) // Only expense transactions, exclude transfers
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const incomeTotal = transactions
    .filter(t => t.amount > 0 && t.categoryId !== null) // Only income transactions, exclude transfers
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate transfer totals
  const transferOutTotal = transactions
    .filter(t => t.amount < 0 && t.categoryId === null) // Only outgoing transfers
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const transferInTotal = transactions
    .filter(t => t.amount > 0 && t.categoryId === null) // Only incoming transfers
    .reduce((sum, t) => sum + t.amount, 0)

  useEffect(() => {
    // Client-side data fetching
    const loadedWallets = loadData('wallets') || []
    const loadedCategories = loadData('categories') || []
    const loadedTransactions = loadData('transactions') || []

    setWallets(loadedWallets)
    setCategories(loadedCategories.filter(c => c.type === activeTab))
    setTransactions(loadedTransactions)
    setIsLoading(false)
  }, [activeTab])

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0)

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'amount') {
      const parsedValue = parseFormattedNumber(value)
      setTransactionForm(prev => ({
        ...prev,
        amount: parsedValue,
        formattedAmount: formatCurrency(parsedValue, true)
      }))
    } else {
      setTransactionForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleTransferInputChange = (e) => {
    const { name, value } = e.target

    if (name === 'amount') {
      const parsedValue = parseFormattedNumber(value)
      setTransferForm(prev => ({
        ...prev,
        amount: parsedValue,
        formattedAmount: formatCurrency(parsedValue, true)
      }))
    } else {
      setTransferForm(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmitTransaction = (e) => {
    e.preventDefault()

    const newTransaction = {
      id: generateId(),
      walletId: parseInt(transactionForm.walletId),
      categoryId: parseInt(transactionForm.categoryId),
      amount: parseFloat(transactionForm.amount) * (activeTab === 'expense' ? -1 : 1),
      date: transactionForm.date,
      note: transactionForm.note,
      isTransfer: false // Mark as regular transaction
    }

    // Update wallet balance
    const updatedWallets = wallets.map(wallet => {
      if (wallet.id === newTransaction.walletId) {
        return {
          ...wallet,
          balance: wallet.balance + newTransaction.amount
        }
      }
      return wallet
    })

    // Save transactions and wallets
    const updatedTransactions = [...transactions, newTransaction]
    saveData('transactions', updatedTransactions)
    saveData('wallets', updatedWallets)

    // Update state
    setTransactions(updatedTransactions)
    setWallets(updatedWallets)

    // Show success message
    showToast(
      activeTab === 'expense'
        ? 'Pengeluaran berhasil ditambahkan'
        : 'Pemasukan berhasil ditambahkan'
    )

    // Reset form
    setTransactionForm({
      walletId: '',
      categoryId: '',
      amount: '',
      formattedAmount: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    })
    setShowTransactionForm(false)
  }

  const handleSubmitTransfer = (e) => {
    e.preventDefault()

    const amount = parseFloat(transferForm.amount)
    const fromWalletId = parseInt(transferForm.fromWalletId)
    const toWalletId = parseInt(transferForm.toWalletId)

    if (fromWalletId === toWalletId) {
      showToast('Tidak bisa transfer ke dompet yang sama', 'error')
      return
    }

    const fromWallet = wallets.find(w => w.id === fromWalletId)
    if (fromWallet.balance < amount) {
      showToast('Saldo tidak mencukupi untuk transfer ini', 'error')
      return
    }

    // Update wallets
    const updatedWallets = wallets.map(wallet => {
      if (wallet.id === fromWalletId) {
        return {
          ...wallet,
          balance: wallet.balance - amount
        }
      }
      if (wallet.id === toWalletId) {
        return {
          ...wallet,
          balance: wallet.balance + amount
        }
      }
      return wallet
    })

    // Get wallet names for transaction notes
    const fromWalletName = wallets.find(w => w.id === fromWalletId)?.name || 'Dompet'
    const toWalletName = wallets.find(w => w.id === toWalletId)?.name || 'Dompet'

    // Create transfer transaction records (out and in)
    const transferOutTransaction = {
      id: generateId(),
      walletId: fromWalletId,
      categoryId: null, // Mark as transfer
      amount: -amount,
      date: new Date().toISOString().split('T')[0],
      note: `Transfer ke ${toWalletName}${transferForm.note ? ': ' + transferForm.note : ''}`,
      isTransfer: true
    }

    const transferInTransaction = {
      id: generateId(),
      walletId: toWalletId,
      categoryId: null, // Mark as transfer
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      note: `Transfer dari ${fromWalletName}${transferForm.note ? ': ' + transferForm.note : ''}`,
      isTransfer: true
    }

    // Save transactions and wallets
    const updatedTransactions = [...transactions, transferOutTransaction, transferInTransaction]
    saveData('transactions', updatedTransactions)
    saveData('wallets', updatedWallets)

    // Update state
    setTransactions(updatedTransactions)
    setWallets(updatedWallets)

    // Show success message
    showToast('Transfer berhasil dilakukan')

    // Reset form
    setTransferForm({
      fromWalletId: '',
      toWalletId: '',
      amount: '',
      formattedAmount: '',
      note: ''
    })
    setShowTransferForm(false)
  }

  const [showTransferCard, setShowTransferCard] = useState(false); // State untuk toggle card transfer

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Di dalam komponen Home, sebelum fungsi getFilteredTransactions
  const allWallets = loadData('wallets') || []
  const allCategories = loadData('categories') || []

  const getWalletName = (id) => {
    const wallet = allWallets.find(w => w.id === id)
    return wallet ? wallet.name : 'Unknown Wallet'
  }

  const getCategoryName = (id) => {
    if (id === null) return 'Transfer'
    const category = allCategories.find(c => c.id === id)
    return category ? category.name : 'Unknown Category'
  }

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.note.toLowerCase().includes(query) ||
        getWalletName(t.walletId).toLowerCase().includes(query) ||
        getCategoryName(t.categoryId).toLowerCase().includes(query)
      );
    }

    // Filter berdasarkan kategori
    if (categoryFilter) {
      filtered = filtered.filter(t =>
        t.categoryId === parseInt(categoryFilter)
      );
    }

    // Filter berdasarkan rentang tanggal
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return filtered;
  }

  const getWalletIcon = (type) => {
    switch (type) {
      case 'cash': return <HiCash className="text-yellow-500" size={20} />
      case 'bank': return <HiCreditCard className="text-blue-500" size={20} />
      case 'ewallet': return <HiDatabase className="text-green-500" size={20} />
      default: return <HiCreditCard className="text-gray-500" size={20} />
    }
  }


  return (
    <div className="p-6 pb-24">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Ringkasan</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        {/* Header with Balance */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-1">Saldo Total</h2>
            {isLoading ? (
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalBalance)}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowTransferCard(!showTransferCard)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            {showTransferCard ? 'Sembunyikan Transfer' : 'Tampilkan Transfer'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Income Card */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-1 rounded-full">
                <HiArrowUp className="text-green-500" size={14} />
              </div>
              <p className="text-green-500 text-xs font-medium">Pemasukan</p>
            </div>
            {isLoading ? (
              <div className="h-5 bg-gray-200 rounded mt-1 w-3/4 animate-pulse"></div>
            ) : (
              <p className="font-semibold text-gray-900 mt-1">
                {formatCurrency(incomeTotal)}
              </p>
            )}
          </div>

          {/* Expense Card */}
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 p-1 rounded-full">
                <HiArrowDown className="text-red-500" size={14} />
              </div>
              <p className="text-red-500 text-xs font-medium">Pengeluaran</p>
            </div>
            {isLoading ? (
              <div className="h-5 bg-gray-200 rounded mt-1 w-3/4 animate-pulse"></div>
            ) : (
              <p className="font-semibold text-gray-900 mt-1">
                {formatCurrency(expenseTotal)}
              </p>
            )}
          </div>

          {/* Transfer Card - Conditionally shown */}
          {showTransferCard && (
            <div className="bg-blue-50 p-3 rounded-lg col-span-2">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-1 rounded-full">
                  <HiArrowRight className="text-blue-500" size={14} />
                </div>
                <p className="text-blue-500 text-xs font-medium">Transfer</p>
              </div>
              {isLoading ? (
                <div className="h-5 bg-gray-200 rounded mt-1 w-3/4 animate-pulse"></div>
              ) : (
                <p className="font-semibold text-gray-900 mt-1">
                  {formatCurrency(transferOutTotal)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Saldo Total */}
      {/* <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-1">Saldo Total</h2>
            {isLoading ? (
              <div className="h-10 bg-gray-200/50 rounded-lg w-3/4 animate-pulse"></div>
            ) : (
              <BalanceDisplay amount={totalBalance} />
            )}
          </div>
          <button
            onClick={() => setShowTransferCard(!showTransferCard)}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            {showTransferCard ? 'Sembunyikan Transfer' : 'Tampilkan Transfer'}
          </button>
        </div>

        <div className="flex space-x-3 mt-6">
          <div className="flex-1 bg-green-500/10 p-4 rounded-xl">
            <p className="text-green-500 text-sm font-medium mb-1">Pemasukan</p>
            {isLoading ? (
              <div className="h-5 bg-gray-200/50 rounded w-3/4 animate-pulse"></div>
            ) : (
              <p className="font-semibold text-gray-900">
                {formatCurrency(incomeTotal)}
              </p>
            )}
          </div>
          <div className="flex-1 bg-red-500/10 p-4 rounded-xl">
            <p className="text-red-500 text-sm font-medium mb-1">Pengeluaran</p>
            {isLoading ? (
              <div className="h-5 bg-gray-200/50 rounded w-3/4 animate-pulse"></div>
            ) : (
              <p className="font-semibold text-gray-900">
                {formatCurrency(expenseTotal)}
              </p>
            )}
          </div>
          {showTransferCard && (
            <div className="flex-1 bg-blue-500/10 p-4 rounded-xl">
              <p className="text-blue-500 text-sm font-medium mb-1">Transfer</p>
              {isLoading ? (
                <div className="h-5 bg-gray-200/50 rounded w-3/4 animate-pulse"></div>
              ) : (
                <p className="font-semibold text-gray-900">
                  {formatCurrency(transferOutTotal)}
                </p>
              )}
            </div>
          )}
        </div>
      </div> */}

      {/* Quick Actions */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => {
            setShowTransactionForm(true)
            setShowTransferForm(false)
            setActiveTab('expense')
          }}
          className="flex-1 bg-white border border-red-100 py-3 px-4 rounded-xl flex flex-col items-center space-y-1 shadow-sm"
        >
          <div className="bg-red-50 p-2 rounded-full">
            <HiArrowDown className="text-red-500" size={18} />
          </div>
          <span className="text-xs text-gray-700">Pengeluaran</span>
        </button>
        <button
          onClick={() => {
            setShowTransactionForm(true)
            setShowTransferForm(false)
            setActiveTab('income')
          }}
          className="flex-1 bg-white border border-green-100 py-3 px-4 rounded-xl flex flex-col items-center space-y-1 shadow-sm"
        >
          <div className="bg-green-50 p-2 rounded-full">
            <HiArrowUp className="text-green-500" size={18} />
          </div>
          <span className="text-xs text-gray-700">Pemasukan</span>
        </button>
        <button
          onClick={() => {
            setShowTransferForm(true)
            setShowTransactionForm(false)
          }}
          className="flex-1 bg-white border border-blue-100 py-3 px-4 rounded-xl flex flex-col items-center space-y-1 shadow-sm"
        >
          <div className="bg-blue-50 p-2 rounded-full">
            <HiArrowRight className="text-blue-500" size={18} />
          </div>
          <span className="text-xs text-gray-700">Transfer</span>
        </button>
      </div>

      {/* Action Buttons */}
      {/* <div className="flex space-x-3 mb-8">
        <button
          onClick={() => {
            setShowTransactionForm(true)
            setShowTransferForm(false)
            setActiveTab('expense')
          }}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
        >
          <HiArrowDown size={18} />
          <span>Pengeluaran</span>
        </button>
        <button
          onClick={() => {
            setShowTransactionForm(true)
            setShowTransferForm(false)
            setActiveTab('income')
          }}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
        >
          <HiArrowUp size={18} />
          <span>Pemasukan</span>
        </button>
        <button
          onClick={() => {
            setShowTransferForm(true)
            setShowTransactionForm(false)
          }}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
        >
          <HiArrowRight size={18} />
          <span>Transfer</span>
        </button>
      </div> */}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {activeTab === 'expense' ? 'Tambah Pengeluaran' : 'Tambah Pemasukan'}
              </h2>
              <button
                onClick={() => setShowTransactionForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dompet</label>
                  <select
                    name="walletId"
                    value={transactionForm.walletId}
                    onChange={handleTransactionInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Dompet</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activeTab === 'expense' ? 'Kategori Pengeluaran' : 'Kategori Pemasukan'}
                  </label>
                  <select
                    name="categoryId"
                    value={transactionForm.categoryId}
                    onChange={handleTransactionInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories
                      .filter(c => c.type === activeTab)
                      .map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                  <input
                    type="text"
                    name="amount"
                    value={transactionForm.formattedAmount}
                    onChange={handleTransactionInputChange}
                    placeholder="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    name="date"
                    value={transactionForm.date}
                    onChange={handleTransactionInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                  <input
                    type="text"
                    name="note"
                    value={transactionForm.note}
                    onChange={handleTransactionInputChange}
                    placeholder="Tambahkan catatan"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTransactionForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 px-4 rounded-lg text-white ${activeTab === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} transition-colors`}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Form Modal */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Transfer Saldo</h2>
              <button
                onClick={() => setShowTransferForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTransfer}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dari Dompet</label>
                  <select
                    name="fromWalletId"
                    value={transferForm.fromWalletId}
                    onChange={handleTransferInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Dompet Asal</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name} ({formatCurrency(wallet.balance)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ke Dompet</label>
                  <select
                    name="toWalletId"
                    value={transferForm.toWalletId}
                    onChange={handleTransferInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Dompet Tujuan</option>
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                  <input
                    type="text"
                    name="amount"
                    value={transferForm.formattedAmount}
                    onChange={handleTransferInputChange}
                    placeholder="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                  <input
                    type="text"
                    name="note"
                    value={transferForm.note}
                    onChange={handleTransferInputChange}
                    placeholder="Tambahkan catatan"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTransferForm(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                >
                  Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dompet Saya</h2>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div
            className="flex space-x-3 overflow-x-auto pb-4 hide-scrollbar"
            style={{
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}
          >
            {/* Custom scrollbar styling for WebKit browsers */}
            <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 bg-white rounded-xl p-4 border border-gray-200 animate-pulse h-20">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))
            ) : wallets.length > 0 ? (
              wallets.map(wallet => (
                <div
                  key={wallet.id}
                  className="flex-shrink-0 w-64 bg-white rounded-xl p-4 border border-gray-200 flex items-center"
                >
                  <div className={`p-2 rounded-full mr-3 ${wallet.type === 'cash' ? 'bg-yellow-100' :
                    wallet.type === 'bank' ? 'bg-blue-100' :
                      wallet.type === 'ewallet' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                    {wallet.type === 'cash' ? <HiCash className="text-yellow-500" size={18} /> :
                      wallet.type === 'bank' ? <HiCreditCard className="text-blue-500" size={18} /> :
                        wallet.type === 'ewallet' ? <HiDatabase className="text-green-500" size={18} /> :
                          <HiCreditCard className="text-gray-500" size={18} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{wallet.name}</h3>
                    <p className="text-gray-500 text-sm">{formatCurrency(wallet.balance)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-shrink-0 w-full bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-gray-500">Belum ada dompet</p>
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-1 mt-2">
            {wallets.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-300"></div>
            ))}
          </div>
        </div>
      </div>


      {/* Daftar Dompet */}
      {/* <h2 className="text-xl font-semibold text-gray-900 mb-4">Dompet Saya</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {isLoading ? (
          [...Array(2)].map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 animate-pulse">
              <div className="h-5 bg-gray-200/50 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200/50 rounded w-1/2"></div>
            </div>
          ))
        ) : wallets.length > 0 ? (
          wallets.map(wallet => (
            <div key={wallet.id} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded-full mr-2 ${wallet.type === 'cash' ? 'bg-yellow-50' :
                  wallet.type === 'bank' ? 'bg-blue-50' :
                    wallet.type === 'ewallet' ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                  {getWalletIcon(wallet.type)}
                </div>
                <h3 className="font-medium text-sm text-gray-900 truncate">{wallet.name}</h3>
              </div>
              <p className="text-gray-500 text-sm">{formatCurrency(wallet.balance)}</p>
            </div>
          ))
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <p className="text-gray-500">Belum ada dompet</p>
          </div>
        )}
      </div> */}

      {/* Transaksi Terakhir */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 items-center justify-center">Transaksi Terakhir</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-500 text-sm"
          >
            {showFilters ? 'Sembunyikan' : 'Filter'}
          </button>
        </div>
      </div>


      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm animate-slide-down">
          <div className="relative mb-4">
            <HiSearch className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tanggal</label>
              <select
                value={dateRange.start ? 'custom' : ''}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    // When selecting custom, initialize with today's date
                    const today = new Date().toISOString().split('T')[0]
                    setDateRange({ start: today, end: today })
                  } else {
                    // When selecting "All", clear the date range
                    setDateRange({ start: '', end: '' })
                  }
                }}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">Semua</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Show date inputs only when custom is selected */}
          {dateRange.start && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dari</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  max={dateRange.end || ''}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sampai</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  min={dateRange.start || ''}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filter Section */}
      {/* <div className="mb-4 space-y-3"> */}
      {/* Search Input */}
      {/* <div className="relative">
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> */}
      {/* Category Filter */}
      {/* <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div> */}

      {/* Date Range Filter */}
      {/* <div className="flex space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dari Tanggal"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sampai Tanggal"
            />
          </div>
        </div> */}

      {/* Reset Filters Button */}
      {/* {(searchQuery || categoryFilter || dateRange.start || dateRange.end) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('');
              setDateRange({ start: '', end: '' });
            }}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            Reset Filter
          </button>
        )}
      </div> */}

      {/* Transaction List */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 overflow-hidden">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200/50 animate-pulse">
              <div className="flex justify-between">
                <div className="w-2/3">
                  <div className="h-4 bg-gray-200/50 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200/50 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200/50 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : getFilteredTransactions().length > 0 ? (
          <div>
            {getFilteredTransactions().slice(0, 5).map(transaction => (
              <div key={transaction.id} className="p-4 border-b border-gray-200/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${transaction.isTransfer
                        ? 'bg-blue-500/10 text-blue-500'
                        : transaction.amount > 0
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                        }`}>
                        {transaction.isTransfer ? (
                          <HiArrowRight size={16} />
                        ) : transaction.amount > 0 ? (
                          <HiArrowUp size={16} />
                        ) : (
                          <HiArrowDown size={16} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {getCategoryName(transaction.categoryId)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getWalletName(transaction.walletId)} • {new Date(transaction.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    {transaction.note && (
                      <p className="text-sm text-gray-600 mt-1 ml-11">{transaction.note}</p>
                    )}
                  </div>
                  <div className={`text-right ${transaction.isTransfer
                    ? 'text-blue-500'
                    : transaction.amount > 0
                      ? 'text-green-500'
                      : 'text-red-500'
                    }`}>
                    <p className="font-medium">
                      {transaction.isTransfer && transaction.amount < 0 ? '-' : ''}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-gray-500">Tidak ada transaksi yang sesuai dengan filter</p>
          </div>
        )}
      </div>
    </div>
  )
}