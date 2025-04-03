'use client'
import { useState } from 'react'
import { loadData, saveData } from '../utils/storage'
import { HiOutlineCloudUpload, HiOutlineCloudDownload, HiOutlineTrash, HiOutlineExclamationCircle } from 'react-icons/hi'

export default function Settings() {
    const [file, setFile] = useState(null)
    const [message, setMessage] = useState({ text: '', type: '' }) // success/error

    const exportData = () => {
        try {
            const data = {
                wallets: loadData('wallets') || [],
                categories: loadData('categories') || [],
                transactions: loadData('transactions') || []
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `myfinance-backup-${new Date().toISOString().split('T')[0]}.json`
            link.click()

            setMessage({ text: 'Backup berhasil diekspor', type: 'success' })
            setTimeout(() => setMessage({ text: '', type: '' }), 3000)
        } catch (error) {
            setMessage({ text: 'Gagal mengekspor data', type: 'error' })
            setTimeout(() => setMessage({ text: '', type: '' }), 3000)
        }
    }

    const importData = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result)

                // Validasi struktur data
                if (data.wallets && data.categories && data.transactions) {
                    saveData('wallets', data.wallets)
                    saveData('categories', data.categories)
                    saveData('transactions', data.transactions)

                    setMessage({ text: 'Data berhasil diimpor!', type: 'success' })
                    setTimeout(() => {
                        setMessage({ text: '', type: '' })
                        window.location.reload()
                    }, 1500)
                } else {
                    setMessage({ text: 'Format file tidak valid', type: 'error' })
                    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
                }
            } catch (error) {
                setMessage({ text: 'File corrupt atau format tidak sesuai', type: 'error' })
                setTimeout(() => setMessage({ text: '', type: '' }), 3000)
            }
        }
        reader.readAsText(file)
    }

    const resetTransactions = () => {
        if (confirm('Reset semua transaksi dan saldo dompet ke 0?\n\n• Transaksi akan dihapus\n• Saldo dompet akan direset ke 0\n• Kategori tetap tersimpan')) {
            try {
                // Reset transactions
                saveData('transactions', [])

                // Reset wallet balances to 0 but keep wallets
                const wallets = loadData('wallets') || []
                const resetWallets = wallets.map(wallet => ({
                    ...wallet,
                    balance: 0
                }))
                saveData('wallets', resetWallets)

                setMessage({ text: 'Transaksi & saldo berhasil direset', type: 'success' })
                setTimeout(() => {
                    setMessage({ text: '', type: '' })
                    window.location.reload()
                }, 1500)
            } catch (error) {
                setMessage({ text: 'Gagal mereset data', type: 'error' })
                setTimeout(() => setMessage({ text: '', type: '' }), 3000)
            }
        }
    }

    const resetAllData = () => {
        if (confirm('Hapus SEMUA data termasuk dompet dan kategori?\n\nIni tidak dapat dibatalkan!')) {
            localStorage.clear()
            setMessage({ text: 'Semua data telah direset', type: 'success' })
            setTimeout(() => {
                setMessage({ text: '', type: '' })
                window.location.reload()
            }, 1500)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pengaturan</h1>

            {/* Status Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-xl ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Backup & Restore Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <HiOutlineCloudUpload className="mr-2 text-blue-500" />
                        Backup & Restore
                    </h2>

                    <div className="space-y-4">
                        <button
                            onClick={exportData}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <HiOutlineCloudDownload size={18} />
                            <span>Ekspor Backup</span>
                        </button>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Impor Backup
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                        <HiOutlineCloudUpload className="mx-auto text-gray-400 mb-1" size={24} />
                                        <p className="text-sm text-gray-500">Klik untuk upload file JSON</p>
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={importData}
                                            className="hidden"
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reset Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <HiOutlineTrash className="mr-2 text-red-500" />
                        Reset Data
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <HiOutlineExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                                <div>
                                    <h3 className="font-medium text-red-800">Reset Transaksi & Saldo</h3>
                                    <p className="text-sm text-red-600 mt-1">
                                        Hapus semua transaksi dan reset saldo dompet ke 0. Kategori tetap tersimpan.
                                    </p>
                                    <button
                                        onClick={resetTransactions}
                                        className="mt-3 bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Reset Transaksi
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50/50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <HiOutlineExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                                <div>
                                    <h3 className="font-medium text-red-800">Reset Semua Data</h3>
                                    <p className="text-sm text-red-600 mt-1">
                                        Hapus semua data termasuk dompet, kategori, dan transaksi. Tidak dapat dikembalikan!
                                    </p>
                                    <button
                                        onClick={resetAllData}
                                        className="mt-3 bg-red-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Reset Semua
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}