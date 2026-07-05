import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../api/client'
import IssueCard from '../components/IssueCard'

export default function IssuesFeed() {
  const [issues, setIssues] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRandom, setShowRandom] = useState(false)
  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  const loadIssues = useCallback(async (p, append = false) => {
    setLoading(true)
    setError('')
    try {
      const data = await api.get(`/issues/feed?page=${p}`)
      if (append) {
        setIssues(prev => [...prev, ...data.issues])
      } else {
        setIssues(data.issues)
        setInitialLoading(false)
      }
      setHasMore(data.hasMore)
      if (!data.hasMore && data.issues.length > 0) {
        setShowRandom(true)
      }
    } catch (err) {
      setError(err.message)
      setInitialLoading(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadIssues(1, false)
  }, [loadIssues])

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const nextPage = page + 1
          setPage(nextPage)
          loadIssues(nextPage, true)
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, loading, page, loadIssues])

  const loadRandom = async () => {
    setLoading(true)
    try {
      const data = await api.get('/issues?page=1&limit=10')
      setIssues(prev => [...prev, ...data.issues])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Issues You May Face</h1>
        <p className="text-sm text-slate-500 mt-1">
          Personalized recommendations based on your activity.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {issues.length === 0 && !loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">No issues found. Post or upvote some issues to get recommendations!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map(issue => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {loading && (
        <div className="text-center py-6">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
        </div>
      )}

      {showRandom && hasMore === false && !loading && (
        <div className="text-center mt-8">
          <p className="text-sm text-slate-400 mb-3">You've seen all recommendations.</p>
          <button
            onClick={loadRandom}
            className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Show Random Issues
          </button>
        </div>
      )}
    </div>
  )
}
