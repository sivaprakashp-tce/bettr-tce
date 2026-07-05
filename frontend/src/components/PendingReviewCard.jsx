import { useState } from 'react'
import { api } from '../api/client'
import { motion } from 'framer-motion'

export default function PendingReviewCard({ issue, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post(`/issues/${issue._id}/confirm`)
      setSuccess('Resolution confirmed!')
      setTimeout(() => onUpdate?.(), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    setError('')
    try {
      await api.post(`/issues/${issue._id}/reject`)
      setSuccess('Resolution rejected.')
      setTimeout(() => onUpdate?.(), 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <h3 className="font-semibold text-blue-900">Pending Your Review</h3>
      </div>

      <h4 className="font-medium text-slate-900 mb-1">{issue.title}</h4>
      <p className="text-sm text-slate-600 mb-3">Resolved by: {issue.resolvedBy?.name || 'Unknown'}</p>

      {issue.resolutionMessage && (
        <p className="text-sm text-slate-600 mb-3 italic">"{issue.resolutionMessage}"</p>
      )}

      {issue.resolutionImageIds?.length > 0 && (
        <div className="flex gap-2 mb-4">
          {issue.resolutionImageIds.map(id => (
            <img
              key={id}
              src={`${import.meta.env.VITE_API_URL}/upload/${id}`}
              alt="Resolution proof"
              className="w-24 h-24 object-cover rounded-lg border border-blue-200"
            />
          ))}
        </div>
      )}

      {success ? (
        <p className="text-sm font-medium text-green-600">{success}</p>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Confirm Resolution'}
          </button>
          <button
            onClick={handleReject}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </motion.div>
  )
}
