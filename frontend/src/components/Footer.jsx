export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Bettr TCE. All rights reserved.
      </div>
    </footer>
  )
}
