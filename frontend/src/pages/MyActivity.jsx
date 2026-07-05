import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import IssueCard from '../components/IssueCard'

const tabs = [
  { key: 'upvoted', label: 'Upvoted' },
  { key: 'commented', label: 'Commented' },
]

export default function MyActivity() {
  const [activeTab, setActiveTab] = useState('upvoted')
  const [upvoted, setUpvoted] = useState([])
  const [commented, setCommented] = useState([])
  const [upvotedTotal, setUpvotedTotal] = useState(0)
  const [commentedTotal, setCommentedTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMoreUpvoted, setHasMoreUpvoted] = useState(false)
  const [hasMoreCommented, setHasMoreCommented] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const loadActivity = async (p = 1, append = false) => {
    try {
      const data = await api.get(`/users/me/activity?page=${p}`)
      if (append) {
        setUpvoted(prev => [...prev, ...data.upvoted])
        setCommented(prev => [...prev, ...data.commented])
      } else {
        setUpvoted(data.upvoted)
        setCommented(data.commented)
      }
      setUpvotedTotal(data.upvotedTotal)
      setCommentedTotal(data.commentedTotal)
      setHasMoreUpvoted(data.hasMoreUpvoted)
      setHasMoreCommented(data.hasMoreCommented)
      setPage(p)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => { loadActivity() }, [])

  const handleLoadMore = () => {
    setLoadingMore(true)
    loadActivity(page + 1, true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentIssues = activeTab === 'upvoted' ? upvoted : commented
  const currentTotal = activeTab === 'upvoted' ? upvotedTotal : commentedTotal
  const hasMore = activeTab === 'upvoted' ? hasMoreUpvoted : hasMoreCommented

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Your Activity</h1>
        <p className="text-slate-500 mt-1">Issues you have upvoted or commented on.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-slate-100">
              {activeTab === tab.key ? currentTotal : (tab.key === 'upvoted' ? upvotedTotal : commentedTotal)}
            </span>
          </button>
        ))}
      </div>

      {currentIssues.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-slate-400 mb-4">
            {activeTab === 'upvoted'
              ? "You haven't upvoted any issues yet."
              : "You haven't commented on any issues yet."}
          </p>
          <Link to="/feed" className="inline-flex px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            Browse Issues
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {currentIssues.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}