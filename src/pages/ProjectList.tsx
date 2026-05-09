import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Trash2 } from 'lucide-react';

// 1. Pointing to your Cloud Backend (Render)
const BASE_URL = import.meta.env.VITE_API_URL || "https://nisrinedashboardbackend-1.onrender.com";
const API_URL = `${BASE_URL}/api/projects`;

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    setLoading(true);
    fetch(API_URL)
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
    <div className="p-12">
      <header className="mb-12">
        <div className="w-20 h-[2px] bg-amber-500 mb-6" />
        <h1 className="text-6xl font-serif italic mb-2">Collection</h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest">
          {loading ? "Waking up server..." : "Click a project to edit its details"}
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-zinc-600 py-20 text-center uppercase tracking-widest text-xs">
          No projects founded.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((p: any) => (
          <div key={p.id} className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-8 hover:border-amber-500/30 transition-all group">
            <div className="aspect-video overflow-hidden rounded-2xl mb-6 bg-black">
               <img src={p.mainImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.title} />
            </div>
            <h3 className="text-2xl font-serif italic mb-6">{p.title}</h3>
            
            <div className="flex gap-3">
              <Link 
                to={`/edit/${p.id}`} 
                className="flex-1 py-4 bg-white text-black text-center rounded-full text-[10px] font-black uppercase hover:bg-amber-500 transition-all"
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
  );
};

export default ProjectList;