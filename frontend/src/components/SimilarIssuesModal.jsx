import { motion, AnimatePresence } from 'framer-motion'

export default function SimilarIssuesModal({ isOpen, issues, onClose, onProceed }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-2">Similar issues found</h2>
            <p className="text-sm text-slate-500 mb-4">
              We found similar issues. Please check if your issue already exists before posting.
            </p>

            {issues.length === 0 ? (
              <p className="text-sm text-slate-400 mb-4">No similar issues found. You can proceed.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {issues.map(issue => (
                  <div key={issue._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="font-medium text-sm text-slate-900">{issue.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded">{issue.department}</span>
                      <span>by {issue.poster?.name || 'Anonymous'}</span>
                      <span className="ml-auto">{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Go back
              </button>
              <button
                onClick={onProceed}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                My issue is different
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
