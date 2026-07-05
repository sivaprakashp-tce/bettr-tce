import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import SimilarIssuesModal from '../components/SimilarIssuesModal'

const DEPARTMENTS = [
  'CSE', 'ECE', 'EEE', 'Mechanical', 'Civil',
  'Administration', 'Hostel', 'Library', 'Campus', 'Other',
]

export default function PostIssue() {
  const navigate = useNavigate()
  const titleRef = useRef()
  const [step, setStep] = useState('similarity_check')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [department, setDepartment] = useState('')
  const [imageIds, setImageIds] = useState([])
  const [uploading, setUploading] = useState(false)
  const [similarIssues, setSimilarIssues] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (step === 'form') titleRef.current?.focus()
  }, [step])

  const checkSimilarIssues = async () => {
    if (!title.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/issues/similar', { title })
      const issues = data.issues || []
      setSimilarIssues(issues)
      if (issues.length === 0) {
        handleProceed()
        return
      }
      setModalOpen(true)
    } catch {
      setSimilarIssues([])
      handleProceed()
    } finally {
      setLoading(false)
    }
  }

  const handleProceed = () => {
    setModalOpen(false)
    setStep('form')
    setShowForm(true)
  }

  const handleClose = () => {
    setModalOpen(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed')
      return
    }
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await api.post('/upload', formData, true)
      setImageIds(prev => [...prev, data.fileId])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !department) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.post('/issues', { title, description, department, imageIds })
      navigate(`/issues/${data.issue._id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Post a New Issue</h1>
          <p className="text-slate-500 mb-6">First, let's check if a similar issue already exists.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Broken projector in room 301"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

            <button
              onClick={checkSimilarIssues}
              disabled={loading || !title.trim()}
              className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Checking...' : 'Check for Similar Issues'}
            </button>
          </div>

          <SimilarIssuesModal
            isOpen={modalOpen}
            issues={similarIssues}
            onClose={handleClose}
            onProceed={handleProceed}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Post Your Issue</h1>
        <p className="text-sm text-slate-500 mb-6">Provide details about the issue you're facing.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the issue in detail..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Photo (optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {imageIds.length > 0 && (
                <span className="text-sm text-green-600">{imageIds.length} file(s) uploaded</span>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setStep('similarity_check') }}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Posting...' : 'Post Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
