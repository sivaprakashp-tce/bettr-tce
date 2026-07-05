import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../api/client'
import StatsCard from '../components/StatsCard'
import PendingReviewCard from '../components/PendingReviewCard'
import IssueCard from '../components/IssueCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [myIssues, setMyIssues] = useState([])
  const [pendingIssues, setPendingIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      const [statsData, myIssuesData] = await Promise.all([
        api.get('/users/me/stats'),
        api.get('/users/me/issues?limit=5'),
      ])
      setStats(statsData.stats)
      const issues = myIssuesData.issues || []
      setPendingIssues(issues.filter(i => i.status === 'pending_review'))
      setMyIssues(issues.filter(i => i.status !== 'pending_review').slice(0, 5))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {greeting()}, {user?.name}!
        </h1>
        <p className="text-slate-500 mt-1">
          {user?.role === 'faculty' ? 'Faculty' : 'Student'}  |  {user?.email}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsCard label="Total Issues" value={stats.totalIssues} color="blue" icon="📊" />
          <StatsCard label="My Issues" value={stats.myIssues} color="yellow" icon="📋" />
          <StatsCard label="My Upvotes" value={stats.myUpvotes} color="purple" icon="👍" />
          <StatsCard label="My Resolved" value={stats.myResolvedIssues} color="green" icon="✅" />
          <Link to="/activity" className="flex items-center justify-center bg-white rounded-xl border border-slate-200 p-4 card-hover text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
            View Activity &rarr;
          </Link>
        </div>
      )}

      {pendingIssues.length > 0 && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Pending Your Review</h2>
          {pendingIssues.map(issue => (
            <PendingReviewCard key={issue._id} issue={issue} onUpdate={loadData} />
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">My Recent Issues</h2>
          <Link to="/my-issues" className="text-sm text-blue-600 hover:underline font-medium">
            View All
          </Link>
        </div>

        {myIssues.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-400 mb-4">You haven't posted any issues yet.</p>
            <Link to="/post-issue" className="inline-flex px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Post Your First Issue
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {myIssues.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
