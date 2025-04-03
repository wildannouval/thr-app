import { loadData, saveData, generateId } from '../../utils/storage'

export default function handler(req, res) {
    if (req.method === 'GET') {
        const transactions = loadData('transactions')
        res.status(200).json(transactions)
    }
    else if (req.method === 'POST') {
        const { walletId, categoryId, amount, date, note } = req.body

        // Validasi
        if (!walletId || !categoryId || !amount || !date) {
            return res.status(400).json({ error: 'Data tidak lengkap' })
        }

        const newTransaction = {
            id: generateId(),
            walletId: Number(walletId),
            categoryId: Number(categoryId),
            amount: Number(amount),
            date,
            note: note || ''
        }

        const transactions = loadData('transactions')
        const updatedTransactions = [...transactions, newTransaction]
        saveData('transactions', updatedTransactions)

        // Update wallet balance
        const wallets = loadData('wallets')
        const walletIndex = wallets.findIndex(w => w.id === Number(walletId))

        if (walletIndex !== -1) {
            const category = loadData('categories').find(c => c.id === Number(categoryId))
            const updatedWallets = [...wallets]

            if (category && category.type === 'income') {
                updatedWallets[walletIndex].balance += Math.abs(Number(amount))
            } else {
                updatedWallets[walletIndex].balance -= Math.abs(Number(amount))
            }

            saveData('wallets', updatedWallets)
        }

        res.status(201).json(newTransaction)
    }
    else {
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}