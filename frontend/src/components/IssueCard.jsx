import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const statusColors = {
  open: 'bg-yellow-100 text-yellow-800',
  pending_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
}

const statusLabels = {
  open: 'Open',
  pending_review: 'Pending Review',
  resolved: 'Resolved',
}

export default function IssueCard({ issue }) {
  const { user } = useAuth()
  const [reportMsg, setReportMsg] = useState('')

  const handleReport = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !issue.poster) return
    try {
      const data = await api.post('/reports', { reportedUserId: issue.poster._id })
      setReportMsg(data.message)
      setTimeout(() => setReportMsg(''), 3000)
    } catch (err) {
      setReportMsg(err.message)
      setTimeout(() => setReportMsg(''), 3000)
    }
  }

  return (
    <Link to={`/issues/${issue._id}`} className="block">
      <div className="bg-white rounded-xl border border-slate-200 p-5 card-hover">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{issue.title}</h3>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[issue.status]}`}>
            {statusLabels[issue.status]}
          </span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{issue.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="bg-slate-100 px-2 py-0.5 rounded">{issue.department}</span>
            <span>
              {issue.poster?.name || 'Anonymous'}
              {issue.poster?.role && (
                <span className={`ml-1 text-xs px-1 rounded ${issue.poster.role === 'faculty' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                  {issue.poster.role}
                </span>
              )}
            </span>
            {user && issue.poster && user._id !== issue.poster._id && (
              <button onClick={handleReport} className="text-red-400 hover:text-red-600 ml-1" title="Report user">
                ⚑
              </button>
            )}
          </div>
          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>
        {reportMsg && <p className="text-xs text-red-500 mt-1">{reportMsg}</p>}
      </div>
    </Link>
  )
}
