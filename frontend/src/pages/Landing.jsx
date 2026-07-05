import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  { title: 'Report Issues', desc: 'Submit complaints about campus facilities, academics, and more with supporting images.', icon: '📋' },
  { title: 'Track Progress', desc: 'Follow the status of your complaints from submission to resolution in real-time.', icon: '📊' },
  { title: 'Community Driven', desc: 'Upvote issues, comment, and help your peers get their problems solved faster.', icon: '🤝' },
  { title: 'Smart Recommendations', desc: 'AI-powered suggestions show you relevant issues you might face.', icon: '🎯' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <section className="gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2 text-xl font-bold">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Bettr TCE
            </div>
            <div className="flex gap-3">
              <Link to="/login" className="px-5 py-2 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-colors">
                Register
              </Link>
            </div>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Voice Matters at{' '}
              <span className="text-yellow-300">TCE</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              A centralized platform for students and faculty to submit, track, and resolve campus complaints efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3.5 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-all glow">
                Get Started
              </Link>
              <Link to="/login" className="px-8 py-3.5 text-base font-semibold text-white border-2 border-white/40 rounded-xl hover:bg-white/10 transition-all">
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 flex justify-center"
          >
            <div className="bg-white/10 rounded-2xl p-1 backdrop-blur-sm max-w-2xl w-full">
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <p className="text-blue-200 text-sm mb-2">ONLY FOR TCE STUDENTS & FACULTY</p>
                <p className="text-white text-lg">Registered with <strong>@student.tce.edu</strong> or <strong>@tce.edu</strong></p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Use This Portal?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Designed to make complaint resolution transparent, efficient, and community-driven.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200 card-hover"
              >
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Ready to Make a Change?</h2>
            <p className="text-slate-500 mb-8">Join your fellow TCE members in making campus life better.</p>
            <Link to="/register" className="inline-flex px-8 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all">
              Create Your Account
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
              Have questions or need assistance? Reach out to us anytime.
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <a href="mailto:support@tce.edu" className="inline-flex items-center gap-3 px-6 py-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-slate-800">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div className="text-left">
                  <p className="text-sm text-slate-500">Sivaprakash P</p>
                  <p className="font-semibold">sivaprakashp@student.tce.edu</p>
                </div>
              </a>
              <a href="mailto:admin@tce.edu" className="inline-flex items-center gap-3 px-6 py-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors text-slate-800">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div className="text-left">
                  <p className="text-sm text-slate-500">Pranesh S</p>
                  <p className="font-semibold">spranesh@student.tce.edu</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
