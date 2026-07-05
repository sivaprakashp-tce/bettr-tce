import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import CommentSection from '../components/CommentSection'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

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

export default function IssueDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [upvoted, setUpvoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)

  const [resolveMode, setResolveMode] = useState(false)
  const [resolveMessage, setResolveMessage] = useState('')
  const [resolveImageIds, setResolveImageIds] = useState([])
  const [resolveLoading, setResolveLoading] = useState(false)

  const [deleteToken, setDeleteToken] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editDept, setEditDept] = useState('')
  const [editImageIds, setEditImageIds] = useState([])
  const [editUploading, setEditUploading] = useState(false)
  const [reportMsg, setReportMsg] = useState('')

  const loadIssue = async () => {
    try {
      const data = await api.get(`/issues/${id}`)
      setIssue(data.issue)
      setVoteCount(data.issue.voteCount || 0)
      setUpvoted(data.issue.userVote || false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadIssue() }, [id])

  const handleUpvote = async () => {
    try {
      const data = await api.post(`/issues/${id}/upvote`)
      setUpvoted(data.upvoted)
      setVoteCount(data.voteCount)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await api.post('/upload', formData, true)
      if (resolveMode) {
        setResolveImageIds(prev => [...prev, data.fileId])
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setEditUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await api.post('/upload', formData, true)
      setEditImageIds(prev => [...prev, data.fileId])
    } catch (err) {
      setError(err.message)
    } finally {
      setEditUploading(false)
    }
  }

  const handleReportUser = async (userId) => {
    if (!userId) return
    try {
      const data = await api.post('/reports', { reportedUserId: userId })
      setReportMsg(data.message)
      setTimeout(() => setReportMsg(''), 4000)
    } catch (err) {
      setReportMsg(err.message)
      setTimeout(() => setReportMsg(''), 4000)
    }
  }

  const handleResolve = async () => {
    if (resolveImageIds.length === 0) {
      setError('Please upload a photo as proof')
      return
    }
    setResolveLoading(true)
    setError('')
    try {
      const data = await api.post(`/issues/${id}/resolve`, { resolutionImageIds: resolveImageIds, resolutionMessage: resolveMessage })
      setIssue(data.issue)
      setResolveMode(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setResolveLoading(false)
    }
  }

  const handleConfirm = async () => {
    try {
      const data = await api.post(`/issues/${id}/confirm`)
      setIssue(data.issue)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReject = async () => {
    try {
      const data = await api.post(`/issues/${id}/reject`)
      setIssue(data.issue)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteRequest = async () => {
    try {
      const data = await api.post(`/issues/${id}/delete-token`)
      setDeleteToken(data.deleteToken)
      setDeleteModalOpen(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/issues/${id}`, { confirmationToken: deleteToken })
      navigate('/my-issues')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEdit = async () => {
    setError('')
    const payload = { title: editTitle, description: editDesc, department: editDept }
    if (editImageIds.length > 0) payload.imageIds = [...(issue?.imageIds || []), ...editImageIds]
    try {
      const data = await api.put(`/issues/${id}`, payload)
      setIssue(data.issue)
      setEditImageIds([])
      setEditMode(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = () => {
    setEditTitle(issue.title)
    setEditDesc(issue.description)
    setEditDept(issue.department)
    setEditImageIds([])
    setEditMode(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !issue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-blue-600 hover:underline">Go back</button>
        </div>
      </div>
    )
  }

  const isPoster = user?._id === issue?.poster?._id
  const canEdit = isPoster && issue?.status === 'open'
  const canDelete = isPoster && issue?.status === 'open'
  const canResolve = issue?.status === 'open'
  const canConfirm = isPoster && issue?.status === 'pending_review'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[issue?.status]}`}>
            {statusLabels[issue?.status]}
          </span>
          <div className="flex items-center gap-2">
            {canEdit && !editMode && (
              <button onClick={startEdit} className="text-xs text-blue-600 hover:underline">Edit</button>
            )}
            {canDelete && (
              <button onClick={handleDeleteRequest} className="text-xs text-red-600 hover:underline">Delete</button>
            )}
          </div>
        </div>

        {editMode ? (
          <div className="space-y-4 mb-6">
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm resize-none" />
            <select value={editDept} onChange={e => setEditDept(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Administration">Administration</option>
              <option value="Hostel">Hostel</option>
              <option value="Library">Library</option>
              <option value="Campus">Campus</option>
              <option value="Other">Other</option>
            </select>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Add more photos (optional)</label>
              <label className="inline-flex px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer">
                {editUploading ? 'Uploading...' : 'Choose Image'}
                <input type="file" accept="image/*" onChange={handleEditImageUpload} className="hidden" disabled={editUploading} />
              </label>
              {editImageIds.length > 0 && <span className="ml-2 text-xs text-green-600">{editImageIds.length} new</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleEdit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
              <button onClick={() => { setEditMode(false); setEditImageIds([]) }} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">{issue?.title}</h1>
            <p className="text-slate-600 mb-4 whitespace-pre-wrap">{issue?.description}</p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
              <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">{issue?.department}</span>
              <span>
                Posted by <strong>{issue?.poster?.name}</strong>
                {issue?.poster?.role && (
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${issue.poster.role === 'faculty' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                    {issue.poster.role}
                  </span>
                )}
                {!isPoster && issue?.poster?._id && (
                  <button onClick={() => handleReportUser(issue.poster._id)} className="ml-2 text-red-400 hover:text-red-600" title="Report user">
                    ⚑ Report
                  </button>
                )}
              </span>
              <span className="ml-auto">{new Date(issue?.createdAt).toLocaleDateString()}</span>
            </div>

            {issue?.imageIds?.length > 0 && (
              <div className="flex gap-3 mb-4 overflow-x-auto scrollbar-hide">
                {issue.imageIds.map(imgId => (
                  <img key={imgId} src={`${import.meta.env.VITE_API_URL}/upload/${imgId}`} alt="Issue" className="w-32 h-32 object-cover rounded-lg border border-slate-200" />
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <button
            onClick={handleUpvote}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              upvoted ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill={upvoted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
            </svg>
            {voteCount}
          </button>

          {canResolve && !resolveMode && (
            <button onClick={() => setResolveMode(true)} className="px-4 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
              Mark as Resolved
            </button>
          )}

          {canConfirm && (
            <>
              <button onClick={handleConfirm} className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Confirm Resolution</button>
              <button onClick={handleReject} className="px-4 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100">Reject</button>
            </>
          )}
        </div>

        {issue?.resolvedBy && issue?.status === 'resolved' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-800 mb-1">
              Resolved by {issue.resolvedBy?.name || 'Unknown'}
              {!isPoster && issue.resolvedBy._id !== user?._id && (
                <button onClick={() => handleReportUser(issue.resolvedBy._id)} className="ml-2 text-xs text-red-400 hover:text-red-600" title="Report user">⚑ Report</button>
              )}
            </p>
            {issue.resolutionMessage && (
              <p className="text-sm text-green-700 mb-2 italic">"{issue.resolutionMessage}"</p>
            )}
            {issue.resolutionImageIds?.length > 0 && (
              <div className="flex gap-2">
                {issue.resolutionImageIds.map(imgId => (
                  <img key={imgId} src={`${import.meta.env.VITE_API_URL}/upload/${imgId}`} alt="Resolution proof" className="w-24 h-24 object-cover rounded-lg border border-green-300" />
                ))}
              </div>
            )}
          </div>
        )}

        {issue?.status === 'pending_review' && issue?.resolvedBy && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-medium text-blue-800 mb-1">
              Proposed resolution by {issue.resolvedBy?.name || 'Unknown'}
              {!isPoster && issue.resolvedBy._id !== user?._id && (
                <button onClick={() => handleReportUser(issue.resolvedBy._id)} className="ml-2 text-xs text-red-400 hover:text-red-600" title="Report user">⚑ Report</button>
              )}
            </p>
            {issue.resolutionMessage && (
              <p className="text-sm text-blue-700 mb-2 italic">"{issue.resolutionMessage}"</p>
            )}
            {issue.resolutionImageIds?.length > 0 && (
              <div className="flex gap-2">
                {issue.resolutionImageIds.map(imgId => (
                  <img key={imgId} src={`${import.meta.env.VITE_API_URL}/upload/${imgId}`} alt="Resolution proof" className="w-24 h-24 object-cover rounded-lg border border-blue-300" />
                ))}
              </div>
            )}
            {isPoster && (
              <p className="text-xs text-blue-600 mt-2">Review the proof above and confirm or reject.</p>
            )}
          </div>
        )}

        {resolveMode && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="font-medium text-slate-900 mb-3">Mark as Resolved</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Upload photo proof *</label>
                <label className="inline-flex px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer">
                  Choose Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {resolveImageIds.length > 0 && <span className="ml-2 text-xs text-green-600">Uploaded</span>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Message (optional)</label>
                <textarea value={resolveMessage} onChange={e => setResolveMessage(e.target.value)} rows={2} placeholder="Describe how the issue was resolved..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleResolve} disabled={resolveLoading || resolveImageIds.length === 0} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {resolveLoading ? 'Submitting...' : 'Submit Resolution'}
                </button>
                <button onClick={() => { setResolveMode(false); setError('') }} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {reportMsg && (
        <div className="mb-3 bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-700">
          {reportMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
        <CommentSection issueId={id} />
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        deleteToken={deleteToken}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteModalOpen(false)}
        loading={deleteLoading}
      />
    </div>
  )
}
