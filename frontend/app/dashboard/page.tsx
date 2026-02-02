'use client'

import { motion } from 'framer-motion'
import { X, Package, TrendingUp, FileText, RefreshCw, Download, Upload, Camera, Plus, Minus, AlertTriangle, Check, Trash2, Edit } from 'lucide-react'
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
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'remove' | 'confirm' | 'new'>('add')
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [quantityInput, setQuantityInput] = useState('')
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [analyzedItems, setAnalyzedItems] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [pendingAction, setPendingAction] = useState<{type: 'add' | 'remove', item: InventoryItem, quantity: number} | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('units')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thebackroom.onrender.com'
      
      // Fetch inventory
      const invResponse = await fetch(`${API_URL}/api/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const invData = await invResponse.json()
      setInventory(invData.inventory || [])

      // Fetch transactions
      const txResponse = await fetch(`${API_URL}/api/transactions`, {
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

  const handleAddStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setModalType('add')
    setQuantityInput('')
    setShowModal(true)
  }

  const handleRemoveStock = (item: InventoryItem) => {
    setSelectedItem(item)
    setModalType('remove')
    setQuantityInput('')
    setShowModal(true)
  }

  const handleNewItem = () => {
    setModalType('new')
    setNewItemName('')
    setNewItemUnit('units')
    setQuantityInput('')
    setShowModal(true)
  }

  const handleDeleteItem = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thebackroom.onrender.com'

      const response = await fetch(`${API_URL}/api/inventory/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchData()
      } else {
        alert('Failed to delete item')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item')
    }
  }

  const handleCreateNewItem = async () => {
    if (!newItemName || !quantityInput) {
      alert('Please fill in all fields')
      return
    }

    const quantity = parseInt(quantityInput)
    if (isNaN(quantity) || quantity < 0) {
      alert('Please enter a valid quantity')
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thebackroom.onrender.com'

      const response = await fetch(`${API_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItemName,
          quantity,
          unit: newItemUnit,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowModal(false)
        setNewItemName('')
        setNewItemUnit('units')
        setQuantityInput('')
      } else {
        alert('Failed to create item')
      }
    } catch (error) {
      console.error('Failed to create item:', error)
      alert('Failed to create item')
    }
  }

  const handleSubmitStockChange = async () => {
    if (!selectedItem || !quantityInput) return

    const quantity = parseInt(quantityInput)
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    // Show confirmation popup
    setPendingAction({
      type: modalType as 'add' | 'remove',
      item: selectedItem,
      quantity,
    })
    setModalType('confirm')
  }

  const handleConfirmAction = async () => {
    if (!pendingAction) return

    try {
      const token = localStorage.getItem('authToken')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thebackroom.onrender.com'

      const response = await fetch(`${API_URL}/api/inventory/${pendingAction.item.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: pendingAction.type.toUpperCase(),
          quantity: pendingAction.quantity,
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowModal(false)
        setSelectedItem(null)
        setQuantityInput('')
        setPendingAction(null)
        setModalType('add')
      } else {
        const data = await response.json()
        alert(data.message || 'Failed to update inventory')
      }
    } catch (error) {
      console.error('Failed to update stock:', error)
      alert('Failed to update inventory')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsAnalyzing(true)

    try {
      const token = localStorage.getItem('authToken')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thebackroom.onrender.com'

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/api/inventory/analyze-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.items.length > 0) {
        setAnalyzedItems(data.items)
        setShowImageUpload(true)
      } else {
        alert(data.message || 'No items found in image')
      }
    } catch (error) {
      console.error('Failed to analyze image:', error)
      alert('Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleBulkAdd = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://thebackroom.onrender.com'

      const response = await fetch(`${API_URL}/api/inventory/bulk-add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: analyzedItems }),
      })

      const data = await response.json()

      if (data.success) {
        await fetchData()
        setShowImageUpload(false)
        setAnalyzedItems([])
        alert(data.message)
      } else {
        alert(data.message || 'Failed to add items')
      }
    } catch (error) {
      console.error('Failed to bulk add:', error)
      alert('Failed to add items')
    }
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
              <label className="glass px-4 py-2 rounded-lg hover:border-brand-green/50 transition cursor-pointer flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isAnalyzing}
                />
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isAnalyzing ? 'Analyzing...' : 'Upload Image'}
                </span>
              </label>
              <button
                onClick={fetchData}
                className="glass px-4 py-2 rounded-lg hover:border-brand-green/50 transition flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleExport}
                className="glass px-4 py-2 rounded-lg hover:border-brand-green/50 transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
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
              <Package className="w-8 h-8 text-brand-green" />
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
              <TrendingUp className="w-8 h-8 text-brand-green" />
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
              <FileText className="w-8 h-8 text-brand-green" />
              <span className="text-sm text-gray-400">Transactions</span>
            </div>
            <div className="text-3xl font-bold">{transactions.length}</div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10">
          <div className="flex space-x-4">
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
          
          {activeTab === 'inventory' && (
            <button
              onClick={handleNewItem}
              className="bg-brand-green text-brand-darker px-4 py-2 rounded-lg font-semibold hover:glow-green transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Item</span>
            </button>
          )}
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
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No inventory items yet. Send a WhatsApp message to get started!
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-white/5 transition group"
                        onMouseEnter={() => setHoveredRow(item.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
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
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddStock(item)}
                              className="px-3 py-1 bg-brand-green/20 text-brand-green rounded-lg text-sm font-semibold hover:bg-brand-green/30 transition flex items-center space-x-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                            <button
                              onClick={() => handleRemoveStock(item)}
                              className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition flex items-center space-x-1"
                            >
                              <Minus className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                            {hoveredRow === item.id && (
                              <button
                                onClick={() => handleDeleteItem(item)}
                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition flex items-center space-x-1"
                                title="Delete item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
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

      {/* Stock Change Modal */}
      {showModal && selectedItem && modalType !== 'confirm' && modalType !== 'new' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border border-white/10 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              {modalType === 'add' ? (
                <>
                  <Plus className="w-6 h-6 text-brand-green" />
                  <span>Add Stock</span>
                </>
              ) : (
                <>
                  <Minus className="w-6 h-6 text-red-400" />
                  <span>Remove Stock</span>
                </>
              )}
            </h2>
            
            <div className="mb-6">
              <p className="text-gray-400 mb-2">Item:</p>
              <p className="text-xl font-semibold">{selectedItem.name}</p>
              <p className="text-sm text-gray-500">Current: {selectedItem.quantity} {selectedItem.unit}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Quantity to {modalType === 'add' ? 'Add' : 'Remove'}
              </label>
              <input
                type="number"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                placeholder="Enter quantity"
                className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-green transition"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedItem(null)
                  setQuantityInput('')
                }}
                className="flex-1 glass px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitStockChange}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                  modalType === 'add'
                    ? 'bg-brand-green text-brand-darker hover:glow-green'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Next
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* New Item Modal */}
      {showModal && modalType === 'new' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border border-white/10 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Plus className="w-6 h-6 text-brand-green" />
              <span>Add New Item</span>
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g., Laptop, Chair, Paper"
                  className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-green transition"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Initial Quantity</label>
                <input
                  type="number"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-green transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-green transition"
                >
                  <option value="units">Units</option>
                  <option value="boxes">Boxes</option>
                  <option value="packs">Packs</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="liters">Liters</option>
                  <option value="pieces">Pieces</option>
                  <option value="meters">Meters</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setNewItemName('')
                  setNewItemUnit('units')
                  setQuantityInput('')
                }}
                className="flex-1 glass px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewItem}
                className="flex-1 bg-brand-green text-brand-darker px-6 py-3 rounded-lg font-semibold hover:glow-green transition"
              >
                Create Item
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && pendingAction && modalType === 'confirm' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border border-white/10 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <span>Confirm Action</span>
            </h2>
            
            <div className="mb-6 p-4 bg-white/5 rounded-lg">
              <p className="text-gray-400 mb-2">You are about to:</p>
              <p className="text-xl font-semibold mb-2 flex items-center space-x-2">
                {pendingAction.type === 'add' ? (
                  <Plus className="w-5 h-5 text-brand-green" />
                ) : (
                  <Minus className="w-5 h-5 text-red-400" />
                )}
                <span>
                  {pendingAction.type === 'add' ? 'Add' : 'Remove'} {pendingAction.quantity} {pendingAction.item.unit}
                </span>
              </p>
              <p className="text-lg">
                {pendingAction.type === 'add' ? 'to' : 'from'} <span className="text-brand-green">{pendingAction.item.name}</span>
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Current: {pendingAction.item.quantity} {pendingAction.item.unit} → New: {
                  pendingAction.type === 'add' 
                    ? pendingAction.item.quantity + pendingAction.quantity
                    : Math.max(0, pendingAction.item.quantity - pendingAction.quantity)
                } {pendingAction.item.unit}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedItem(null)
                  setQuantityInput('')
                  setPendingAction(null)
                  setModalType('add')
                }}
                className="flex-1 glass px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                  pendingAction.type === 'add'
                    ? 'bg-brand-green text-brand-darker hover:glow-green'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Upload Results Modal */}
      {showImageUpload && analyzedItems.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 border border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
              <Camera className="w-6 h-6 text-brand-green" />
              <span>Items Found in Image</span>
            </h2>
            
            <p className="text-gray-400 mb-4">
              Review the items detected by AI. Click "Add All" to add them to your inventory.
            </p>

            <div className="space-y-3 mb-6">
              {analyzedItems.map((item, index) => (
                <div key={index} className="glass p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg">{item.name}</p>
                      <p className="text-sm text-gray-400">
                        Quantity: <span className="text-brand-green font-mono">{item.quantity}</span> {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAnalyzedItems(analyzedItems.filter((_, i) => i !== index))
                      }}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowImageUpload(false)
                  setAnalyzedItems([])
                }}
                className="flex-1 glass px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAdd}
                className="flex-1 bg-brand-green text-brand-darker px-6 py-3 rounded-lg font-semibold hover:glow-green transition"
              >
                Add All ({analyzedItems.length})
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
