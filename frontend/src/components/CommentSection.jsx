import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'

export default function CommentSection({ issueId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportMsgs, setReportMsgs] = useState({})

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get(`/issues/${issueId}/comments`)
        setComments(data.comments)
      } catch {
        // silently fail
      }
    })()
  }, [issueId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.post(`/issues/${issueId}/comments`, { message })
      setComments(prev => [...prev, data.comment])
      setMessage('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async (userId) => {
    try {
      const data = await api.post('/reports', { reportedUserId: userId })
      setReportMsgs(prev => ({ ...prev, [userId]: data.message }))
      setTimeout(() => setReportMsgs(prev => { const n = { ...prev }; delete n[userId]; return n }), 3000)
    } catch (err) {
      setReportMsgs(prev => ({ ...prev, [userId]: err.message }))
      setTimeout(() => setReportMsgs(prev => { const n = { ...prev }; delete n[userId]; return n }), 3000)
    }
  }

  return (
    <div>
      <h3 className="font-semibold text-slate-900 mb-4">
        Comments ({comments.length})
      </h3>

      <div className="space-y-4 mb-6">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400">No comments yet.</p>
        )}
        {comments.map(comment => (
          <div key={comment._id} className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-900">{comment.user?.name}</span>
              {comment.user?.role && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${comment.user.role === 'faculty' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                  {comment.user.role}
                </span>
              )}
              {user && comment.user && user._id !== comment.user._id && (
                <button onClick={() => handleReport(comment.user._id)} className="text-xs text-red-400 hover:text-red-600" title="Report user">⚑</button>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-slate-600">{comment.message}</p>
            {reportMsgs[comment.user?._id] && (
              <p className="text-xs text-orange-600 mt-1">{reportMsgs[comment.user._id]}</p>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Share your experience or suggest a solution..."
          rows={3}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="mt-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  )
}
