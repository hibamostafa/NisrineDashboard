import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Home, FolderKanban, Plus, Loader2 } from 'lucide-react';

// Pointing to your Cloud Backend (Render)
const BASE_URL = import.meta.env.VITE_API_URL || "https://nisrinedashboardbackend.onrender.com";
const API_URL = `${BASE_URL}/api/projects`;

type Project = {
  id: number;
  title: string;
  category: string;
  brand: string;
  description: string;
  location: string;
  year: string;
  mainImage: string;
  projectImages: { url: string }[];
};

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    setLoading(true);
    fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => { 
    fetchProjects(); 
  }, []);

  const deleteProject = async (id: number) => {
    if(window.confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchProjects(); // Refresh list after delete
        } else {
          alert("Failed to delete project.");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080808] text-zinc-900 dark:text-white font-sans pb-32 lg:pb-20 transition-colors duration-300">
      
      {/* Sidebar Navigation (Large Screens Only) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white p-8 dark:border-white/10 dark:bg-[#0d0d0d] lg:flex">
        <button type="button" onClick={() => navigate("/")} className="mb-12 text-left">
          <span className="block text-2xl font-serif italic">Nisrine</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-amber-500">Dashboard</span>
        </button>
        <nav className="space-y-2" aria-label="Main navigation">
          <button type="button" onClick={() => navigate("/")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-amber-500/10 hover:text-amber-500"><Home size={17} /> Overview</button>
          <button type="button" onClick={() => navigate("/")} className="flex w-full items-center gap-3 rounded-xl bg-amber-500 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-black"><FolderKanban size={17} /> Projects</button>
          <button type="button" onClick={() => navigate("/add")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-amber-500/10 hover:text-amber-500"><Plus size={17} /> Add Project</button>
        </nav>
      </aside>

      {/* Sticky Bottom Navigation (Mobile Screens Only) */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-zinc-200 bg-white/95 px-3 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0d0d0d]/95 lg:hidden" aria-label="Mobile navigation">
        <button type="button" onClick={() => navigate("/")} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-amber-500"><Home size={19} /><span className="text-[8px] font-bold uppercase tracking-widest">Home</span></button>
        <button type="button" onClick={() => navigate("/")} className="flex flex-col items-center gap-1 text-amber-500"><FolderKanban size={19} /><span className="text-[8px] font-bold uppercase tracking-widest">Projects</span></button>
        <button type="button" onClick={() => navigate("/add")} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-amber-500"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"><Plus size={20} /></span><span className="text-[8px] font-bold uppercase tracking-widest">Add</span></button>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 lg:ml-64">
        
        {/* Header Section */}
        <header className="mb-8 sm:mb-12 border-l-4 border-amber-500 pl-4 sm:pl-8">
          <h1 className="text-4xl sm:text-6xl font-serif italic mb-1 sm:mb-2 leading-tight">Collection</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-widest">
            {loading ? "Waking up server..." : "Click a project to edit its details"}
          </p>
        </header>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="text-amber-500 animate-spin" size={40} />
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-zinc-400 dark:text-zinc-600 py-20 text-center uppercase tracking-widest text-xs">
            No projects found.
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {projects.map((p) => (
            <div key={p.id} className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 rounded-xl sm:rounded-2xl lg:rounded-[3rem] p-4 sm:p-8 hover:border-amber-500/30 dark:hover:border-amber-500/30 transition-all group shadow-sm dark:shadow-none">
              <div className="aspect-video overflow-hidden rounded-xl sm:rounded-2xl mb-6 bg-zinc-200 dark:bg-black">
                {p.mainImage ? (
                  <img src={p.mainImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    No Preview Available
                  </div>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-serif italic mb-6 text-zinc-900 dark:text-white">{p.title}</h3>
              
              <div className="flex gap-3">
                <Link 
                  to={`/edit/${p.id}`} 
                  className="flex-1 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black text-center rounded-full text-[10px] font-black uppercase hover:bg-amber-500 hover:text-black dark:hover:bg-amber-500 dark:hover:text-black transition-all"
                >
                  Edit Project
                </Link>
                
                <button 
                  type="button"
                  onClick={() => deleteProject(p.id)} 
                  title="Delete project"
                  className="p-4 bg-red-600/10 text-red-500 rounded-full hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;