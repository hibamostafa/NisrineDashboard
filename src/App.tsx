import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutGrid, PlusCircle, Home } from 'lucide-react';
import AddProject from './pages/AddProject'; // The Form (Add/Edit)
import ProjectList from './pages/ProjectList';       // The Dashboard (View All)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#080808] text-white flex">
        {/* SIDE NAVBAR */}
        <nav className="w-64 border-r border-white/5 p-8 flex flex-col gap-10 h-screen sticky top-0 bg-[#080808]">
          <div className="font-serif italic text-2xl mb-4 text-amber-500">Studio Admin</div>
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors text-[10px] uppercase tracking-widest font-bold">
              <LayoutGrid size={18} /> View Collection
            </Link>
            <Link to="/add" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors text-[10px] uppercase tracking-widest font-bold">
              <PlusCircle size={18} /> Add Project
            </Link>
          </div>
          <div className="mt-auto border-t border-white/5 pt-8">
            <a href="https://nisrinedashboardbackend-1.onrender.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-600 hover:text-white transition-colors text-[10px] uppercase tracking-widest">
              <Home size={14} /> Main Website
            </a>
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#080808]">
          <Routes>
            <Route path="/" element={<ProjectList />} /> 
            <Route path="/add" element={<AddProject />} /> 
            <Route path="/edit/:id" element={<AddProject />} /> 
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;