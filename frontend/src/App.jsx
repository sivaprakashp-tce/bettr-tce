import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import PostIssue from './pages/PostIssue'
import MyIssues from './pages/MyIssues'
import MyActivity from './pages/MyActivity'
import IssueDetail from './pages/IssueDetail'
import IssuesFeed from './pages/IssuesFeed'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/post-issue" element={<ProtectedRoute><PostIssue /></ProtectedRoute>} />
          <Route path="/my-issues" element={<ProtectedRoute><MyIssues /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
          <Route path="/issues/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><IssuesFeed /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
