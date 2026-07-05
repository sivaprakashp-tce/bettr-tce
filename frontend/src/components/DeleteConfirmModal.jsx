import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DeleteConfirmModal({ isOpen, deleteToken, onConfirm, onClose, loading }) {
  const [input, setInput] = useState('')

  const handleConfirm = () => {
    if (input === deleteToken) {
      onConfirm()
      setInput('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-2">Confirm Deletion</h2>
            <p className="text-sm text-slate-500 mb-4">
              This action cannot be undone. Please type the following token to confirm:
            </p>

            <div className="bg-slate-100 rounded-lg p-4 mb-4 text-center">
              <span className="text-2xl font-mono font-bold tracking-wider text-red-600">
                {deleteToken}
              </span>
            </div>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type the token above"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { onClose(); setInput('') }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={input !== deleteToken || loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
