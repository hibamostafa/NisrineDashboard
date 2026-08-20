import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowLeft, Calendar, Send, Layers, 
  X, ImageIcon, Upload, Loader2, Link as LinkIcon, Home, FolderKanban, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Keep the API configurable and avoid malformed URLs when VITE_API_URL ends in a slash.
const DEFAULT_BACKEND = (import.meta.env.VITE_API_URL || "https://nisrinedashboardbackend.onrender.com").replace(/\/+$/, "");
const API_URL = `${DEFAULT_BACKEND}/api/projects`;

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

const AddProject = () => {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const isEdit = !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [project, setProject] = useState<Project>({
    id: 0,
    title: "", 
    category: "INTERIOR", 
    brand: "LYDIA",
    description: "", 
    location: "", 
    year: new Date().getFullYear().toString(),
    mainImage: "", 
    projectImages: [] 
  });

  const [tempLink, setTempLink] = useState("");

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetch(`${API_URL}/${id}`)
        .then(res => {
          if (!res.ok) throw new Error("Project not found");
          return res.json();
        })
        .then(data => {
          setProject({
            ...data,
            projectImages: Array.isArray(data.projectImages) ? data.projectImages : [] 
          });
        })
        .catch(err => {
          console.error("Load error:", err);
          navigate("/");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  // --- HANDLER FOR GALLERY DROP ---
  const onDropGallery = useCallback(async (acceptedFiles: File[]) => {
    const filePromises = acceptedFiles.map((file) => {
      return new Promise<{ url: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ url: reader.result as string });
        reader.readAsDataURL(file);
      });
    });

    const newImages = await Promise.all(filePromises);
    setProject(prev => ({
      ...prev,
      projectImages: [...(prev.projectImages || []), ...newImages]
    }));
  }, []);

  // --- HANDLER FOR HERO DROP ---
  const onDropHero = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProject(prev => ({ ...prev, mainImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Dropzone instances
  const { getRootProps: getGalleryProps, getInputProps: getGalleryInput } = useDropzone({ 
    onDrop: onDropGallery, 
    accept: { 'image/*': [] } 
  });

  const { getRootProps: getHeroProps, getInputProps: getHeroInput, isDragActive: isHeroDragActive } = useDropzone({ 
    onDrop: onDropHero, 
    accept: { 'image/*': [] },
    multiple: false
  });

  const addLinkToGallery = () => {
    if (tempLink.trim()) {
      const links = tempLink.split(/[\s,]+/).filter(link => link.trim().startsWith('http'));
      const newEntries = links.map(url => ({ url }));
      setProject(prev => ({ 
        ...prev, 
        projectImages: [...(prev.projectImages || []), ...newEntries] 
      }));
      setTempLink("");
    }
  };

  const removeImage = (index: number) => {
    setProject(prev => ({ 
        ...prev, 
        projectImages: (prev.projectImages || []).filter((_, i) => i !== index) 
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `${API_URL}/${id}` : API_URL;

    const payload = {
        ...project,
        id: isEdit ? Number(id) : 0
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(isEdit ? "✨ Project Updated!" : "✨ Project Published!");
        navigate("/");
      } else {
        const errorText = await response.text();
        alert(`Server Error: ${errorText}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Network Error: Unable to reach the backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#080808] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="text-amber-500 animate-spin" size={40} />
    </div>
  );

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
          <button type="button" onClick={() => navigate("/")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-zinc-500 hover:bg-amber-500/10 hover:text-amber-500"><FolderKanban size={17} /> Projects</button>
          <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-amber-500 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-black"><Plus size={17} /> Add Project</button>
        </nav>
      </aside>

      {/* Sticky Bottom Navigation (Mobile Screens Only) */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-zinc-200 bg-white/95 px-3 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0d0d0d]/95 lg:hidden" aria-label="Mobile navigation">
        <button type="button" onClick={() => navigate("/")} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-amber-500"><Home size={19} /><span className="text-[8px] font-bold uppercase tracking-widest">Home</span></button>
        <button type="button" onClick={() => navigate("/")} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-amber-500"><FolderKanban size={19} /><span className="text-[8px] font-bold uppercase tracking-widest">Projects</span></button>
        <button type="button" className="flex flex-col items-center gap-1 text-amber-500"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-black"><Plus size={20} /></span><span className="text-[8px] font-bold uppercase tracking-widest">Add</span></button>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 lg:ml-64">
        
        {/* Navigation Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
            <button 
              type="button" 
              onClick={() => navigate("/")} 
              aria-label="Go back to project list"
              className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1" />
                <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Back to List</span>
            </button>
            <div className="px-4 py-1 rounded-full border border-zinc-200 dark:border-white/10 text-[9px] tracking-[0.3em] text-zinc-500 dark:text-zinc-400 font-bold uppercase bg-white dark:bg-transparent">
                {project.projectImages?.length || 0} Images in Gallery
            </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-6 space-y-6 sm:space-y-12">
            <header className="border-l-4 border-amber-500 pl-4 sm:pl-8">
              <h1 className="text-3xl sm:text-6xl font-serif italic mb-1 sm:mb-2 leading-tight">
                {isEdit ? "Edit Entry" : "New Entry"}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-[0.4em]"> Sync...</p>
            </header>

            {/* Project Details Form */}
            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-4 sm:p-8 lg:p-10 rounded-xl sm:rounded-2xl lg:rounded-[3rem] space-y-6 shadow-sm dark:shadow-none">
                <div className="space-y-2">
                    <label htmlFor="project-title" className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold ml-2">Project Title</label>
                    <input 
                      id="project-title"
                      required 
                      className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-300 dark:border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl text-lg sm:text-2xl font-serif text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" 
                      value={project.title} 
                      onChange={e => setProject({...project, title: e.target.value})} 
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                        <label htmlFor="category-select" className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold ml-2">Category</label>
                        <select 
                          id="category-select"
                          className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-300 dark:border-white/10 p-4 rounded-xl outline-none appearance-none text-base sm:text-sm text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
                          value={project.category} 
                          onChange={e => setProject({...project, category: e.target.value})}
                        >
                            <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" value="INTERIOR">INTERIOR</option>
                            <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" value="EXTERIOR">EXTERIOR</option>
                            <option className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white" value="LANDSCAPES">LANDSCAPES</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="year-input" className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold ml-2 flex items-center gap-2"><Calendar size={12}/> Year</label>
                        <input 
                          id="year-input"
                          className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-300 dark:border-white/10 p-4 rounded-xl outline-none text-base sm:text-sm text-zinc-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
                          value={project.year} 
                          onChange={e => setProject({...project, year: e.target.value})} 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="description-area" className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold ml-2">Description</label>
                    <textarea 
                      id="description-area"
                      className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-300 dark:border-white/10 p-4 sm:p-6 rounded-2xl h-40 sm:h-64 outline-none resize-none font-light text-zinc-700 dark:text-zinc-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
                      value={project.description} 
                      onChange={e => setProject({...project, description: e.target.value})} 
                    />
                </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 sm:space-y-10">
             {/* HERO IMAGE SECTION */}
             <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-4 sm:p-8 rounded-xl sm:rounded-2xl lg:rounded-[3rem] space-y-4 sm:space-y-6 shadow-sm dark:shadow-none">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-amber-500">
                      <ImageIcon size={16} aria-hidden="true" />
                      <h3 className="text-[10px] tracking-[0.4em] font-black uppercase">Hero Image</h3>
                  </div>
                  {project.mainImage && (
                    <button 
                      type="button" 
                      onClick={() => setProject({...project, mainImage: ""})}
                      className="text-[9px] text-zinc-500 hover:text-red-500 uppercase tracking-widest font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Hero Dropzone / Preview Area */}
                <div 
                  {...getHeroProps()} 
                  className={`relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed transition-all cursor-pointer
                    ${isHeroDragActive ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-black hover:border-amber-500/50'}
                    ${project.mainImage ? 'border-none' : ''}
                  `}
                >
                    <input {...getHeroInput()} aria-label="Hero image upload" />
                    {project.mainImage ? (
                      <>
                        <img src={project.mainImage} className="w-full h-full object-cover" alt="Project hero preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Tap to change image</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <Upload className="mx-auto text-zinc-400 dark:text-zinc-700" size={26} aria-hidden="true" />
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">Tap to Select or Drag Hero Image</p>
                      </div>
                    )}
                </div>

                {/* Option to paste URL */}
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 p-3 sm:p-4 rounded-xl">
                    <LinkIcon size={14} className="text-zinc-400 dark:text-zinc-600 flex-shrink-0" />
                    <input 
                      aria-label="Hero image URL"
                      className="flex-1 bg-transparent text-sm sm:text-xs text-zinc-900 dark:text-white outline-none focus:text-amber-500 transition-all" 
                      placeholder="Or paste direct image URL here..." 
                      value={(project.mainImage || "").startsWith('data:') ? "[Uploaded File]" : project.mainImage || ""} 
                      onChange={e => setProject({...project, mainImage: e.target.value})} 
                    />
                </div>
             </div>

             {/* VISUAL GALLERY SECTION */}
             <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5 p-4 sm:p-8 rounded-xl sm:rounded-2xl lg:rounded-[3rem] space-y-4 sm:space-y-6 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-3 text-amber-500">
                    <Layers size={16} aria-hidden="true" />
                    <h3 className="text-[10px] tracking-[0.4em] font-black uppercase">Visual Gallery</h3>
                </div>

                <div {...getGalleryProps()} className="border-2 border-dashed rounded-xl sm:rounded-[2rem] p-6 sm:p-12 text-center border-zinc-300 dark:border-white/10 bg-zinc-100 dark:bg-black/20 hover:border-amber-500 transition-all cursor-pointer">
                    <input {...getGalleryInput()} aria-label="Upload gallery images" />
                    <Upload className="mx-auto text-amber-500/50 mb-2" aria-hidden="true" />
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold">Tap to Select or Drag Photos</p>
                </div>

                <div className="flex gap-2">
                    <input 
                      aria-label="Paste image link for gallery"
                      className="flex-1 bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 p-3 sm:p-4 rounded-xl text-sm sm:text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
                      placeholder="Paste Link..." 
                      value={tempLink} 
                      onChange={e => setTempLink(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={addLinkToGallery} 
                      className="bg-zinc-900 dark:bg-white text-white dark:text-black hover:text-black dark:hover:bg-amber-500 px-4 sm:px-6 rounded-xl font-black text-[10px] uppercase hover:bg-amber-500 transition-colors flex-shrink-0"
                    >
                      Add
                    </button>
                </div>

                <div className="max-h-[350px] sm:max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                        <AnimatePresence>
                            {project.projectImages?.map((img, i) => (
                                <motion.div key={img.url + i} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900">
                                    <img src={img.url} className="w-full h-full object-cover" alt={`Gallery item ${i + 1}`} />
                                    <button 
                                      type="button" 
                                      onClick={() => removeImage(i)} 
                                      aria-label={`Remove image ${i + 1}`}
                                      className="absolute inset-0 bg-red-600/90 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                                    >
                                        <X size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
             </div>

             {/* Submission Action Button */}
             <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-5 sm:py-8 bg-amber-500 text-black font-black uppercase tracking-[0.4em] text-[10px] sm:text-[11px] rounded-full hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} aria-hidden="true" />
                ) : (
                  <>
                    {isEdit ? "Updated!" : "Published!"}
                    <Send size={16} aria-hidden="true" />
                  </>
                )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProject;