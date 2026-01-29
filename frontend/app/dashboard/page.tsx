'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  updated_at: string
  updated_by: string
}

interface Transaction {
  id: string
  action: string
  item_name: string
  quantity: number
  created_at: string
  user_id: string
}

export default function DashboardPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions'>('inventory')
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/auth/signin')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      
      // Fetch inventory
      const invResponse = await fetch('/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const invData = await invResponse.json()
      setInventory(invData.inventory || [])

      // Fetch transactions
      const txResponse = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const txData = await txResponse.json()
      setTransactions(txData.transactions || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push('/')
  }

  const handleExport = () => {
    // Convert inventory to CSV
    const headers = ['Item Name', 'Quantity', 'Unit', 'Last Updated']
    const rows = inventory.map(item => [
      item.name,
      item.quantity,
      item.unit,
      new Date(item.updated_at).toLocaleString()
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const totalSKUs = inventory.length

  return (
    <div className="min-h-screen bg-brand-darker">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-brand-darker font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">The Backroom</h1>
                <p className="text-sm text-gray-400">Inventory Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchData}
                className="glass px-4 py-2 rounded-lg hover:border-brand-green/50 transition flex items-center space-x-2"
              >
                <span className="text-white">🔄</span>
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="glass px-4 py-2 rounded-lg hover:border-brand-green/50 transition flex items-center space-x-2"
              >
                <span>💾</span>
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleLogout}
                className="glass px-4 py-2 rounded-lg hover:border-red-500/50 transition flex items-center space-x-2 text-red-400"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📦</span>
              <span className="text-sm text-gray-400">Total Items</span>
            </div>
            <div className="text-3xl font-bold">{totalItems.toLocaleString()}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📊</span>
              <span className="text-sm text-gray-400">SKUs</span>
            </div>
            <div className="text-3xl font-bold">{totalSKUs}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📝</span>
              <span className="text-sm text-gray-400">Transactions</span>
            </div>
            <div className="text-3xl font-bold">{transactions.length}</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'inventory'
                ? 'text-brand-green border-b-2 border-brand-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-4 font-semibold transition ${
              activeTab === 'transactions'
                ? 'text-brand-green border-b-2 border-brand-green'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transaction History
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="glass rounded-xl p-12 border border-white/10 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your data...</p>
          </div>
        ) : activeTab === 'inventory' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Item Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Unit</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                        No inventory items yet. Send a WhatsApp message to get started!
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4 font-medium">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="text-brand-green font-bold font-mono">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{item.unit}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(item.updated_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl border border-white/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition">
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              tx.action === 'ADD'
                                ? 'bg-green-500/20 text-green-400'
                                : tx.action === 'REMOVE'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {tx.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">{tx.item_name}</td>
                        <td className="px-6 py-4 font-mono">{tx.quantity}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
