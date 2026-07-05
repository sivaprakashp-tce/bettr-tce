import { useState, useEffect } from 'react'
import { api } from '../api/client'
import IssueCard from '../components/IssueCard'
import PendingReviewCard from '../components/PendingReviewCard'

export default function MyIssues() {
  const [issues, setIssues] = useState([])
  const [pendingIssues, setPendingIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState('')

  const loadIssues = async (p = 1) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get(`/users/me/issues?page=${p}&limit=20`)
      if (p === 1) {
        setIssues(data.issues.filter(i => i.status !== 'pending_review'))
        setPendingIssues(data.issues.filter(i => i.status === 'pending_review'))
      } else {
        setIssues(prev => [...prev, ...data.issues.filter(i => i.status !== 'pending_review')])
      }
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadIssues(1) }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Issues</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {pendingIssues.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-blue-800">Pending Your Review</h2>
          {pendingIssues.map(issue => (
            <PendingReviewCard key={issue._id} issue={issue} onUpdate={() => loadIssues(1)} />
          ))}
        </div>
      )}

      {!loading && issues.length === 0 && pendingIssues.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">You haven't posted any issues yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {issues.map(issue => (
          <IssueCard key={issue._id} issue={issue} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => { setPage(p => p + 1); loadIssues(page + 1) }}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {loading && issues.length > 0 && (
        <div className="text-center mt-6">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
        </div>
      )}
    </div>
  )
}
