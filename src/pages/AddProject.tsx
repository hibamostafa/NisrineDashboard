import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowLeft, Calendar, Send, Layers, 
  X, ImageIcon, Upload, Loader2, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = "https://nisrinedashboardbackend-1.onrender.com";
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
      alert("Network Error: Backend connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <Loader2 className="text-amber-500 animate-spin" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="flex justify-between items-center mb-12">
            <button 
              type="button" 
              onClick={() => navigate("/")} 
              aria-label="Go back to project list"
              className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-all group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1" />
                <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Back to List</span>
            </button>
            <div className="px-4 py-1 rounded-full border border-white/10 text-[9px] tracking-[0.3em] text-zinc-500 font-bold uppercase">
                {project.projectImages?.length || 0} Images in Gallery
            </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-6 space-y-12">
            <header className="border-l-4 border-amber-500 pl-8">
              <h1 className="text-6xl font-serif italic mb-2 leading-tight">
                {isEdit ? "Edit Entry" : "New Entry"}
              </h1>
              <p className="text-zinc-500 text-xs uppercase tracking-[0.4em]"> Sync...</p>
            </header>

            <div className="bg-zinc-900/30 border border-white/5 p-10 rounded-[3rem] space-y-8">
                <div className="space-y-4">
                    <label htmlFor="project-title" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-2">Project Title</label>
                    <input 
                      id="project-title"
                      required 
                      className="w-full bg-black/20 border border-white/10 p-6 rounded-2xl text-2xl font-serif focus:border-amber-500 outline-none transition-all" 
                      value={project.title} 
                      onChange={e => setProject({...project, title: e.target.value})} 
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="category-select" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-2">Category</label>
                        <select 
                          id="category-select"
                          className="w-full bg-black/20 border border-white/10 p-4 rounded-xl outline-none appearance-none" 
                          value={project.category} 
                          onChange={e => setProject({...project, category: e.target.value})}
                        >
                            <option value="INTERIOR">INTERIOR</option>
                            <option value="EXTERIOR">EXTERIOR</option>
                            <option value="LANDSCAPES">LANDSCAPES</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="year-input" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-2 flex items-center gap-2"><Calendar size={12}/> Year</label>
                        <input 
                          id="year-input"
                          className="w-full bg-black/20 border border-white/10 p-4 rounded-xl outline-none" 
                          value={project.year} 
                          onChange={e => setProject({...project, year: e.target.value})} 
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <label htmlFor="description-area" className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-2">Description</label>
                    <textarea 
                      id="description-area"
                      className="w-full bg-black/20 border border-white/10 p-6 rounded-3xl h-64 outline-none resize-none font-light text-zinc-400" 
                      value={project.description} 
                      onChange={e => setProject({...project, description: e.target.value})} 
                    />
                </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-10">
             {/* HERO IMAGE SECTION */}
             <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[3rem] space-y-6">
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
                  className={`relative aspect-video rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed transition-all cursor-pointer
                    ${isHeroDragActive ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-black hover:border-amber-500/50'}
                    ${project.mainImage ? 'border-none' : ''}
                  `}
                >
                    <input {...getHeroInput()} aria-label="Hero image upload" />
                    {project.mainImage ? (
                      <>
                        <img src={project.mainImage} className="w-full h-full object-cover" alt="Project hero preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                            <p className="text-[10px] font-black uppercase tracking-widest">Drop new image to replace</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-3">
                        <Upload className="mx-auto text-zinc-700" size={30} aria-hidden="true" />
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Drag & Drop Hero Image</p>
                      </div>
                    )}
                </div>

                {/* Option to paste URL */}
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-xl">
                    <LinkIcon size={14} className="text-zinc-600" />
                    <input 
                      aria-label="Hero image URL"
                      className="flex-1 bg-transparent text-xs outline-none focus:text-amber-500 transition-all" 
                      placeholder="Or paste direct image URL here..." 
                      value={project.mainImage.startsWith('data:') ? "[Uploaded File]" : project.mainImage} 
                      onChange={e => setProject({...project, mainImage: e.target.value})} 
                    />
                </div>
             </div>

             {/* VISUAL GALLERY SECTION */}
             <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[3rem] space-y-6">
                <div className="flex items-center gap-3 text-amber-500">
                    <Layers size={16} aria-hidden="true" />
                    <h3 className="text-[10px] tracking-[0.4em] font-black uppercase">Visual Gallery</h3>
                </div>

                <div {...getGalleryProps()} className="border-2 border-dashed rounded-[2rem] p-12 text-center border-white/10 bg-black/20 hover:border-amber-500 transition-all cursor-pointer">
                    <input {...getGalleryInput()} aria-label="Upload gallery images" />
                    <Upload className="mx-auto text-amber-500/50 mb-3" aria-hidden="true" />
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Upload Photos</p>
                </div>

                <div className="flex gap-2">
                    <input 
                      aria-label="Paste image link for gallery"
                      className="flex-1 bg-black/40 border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-amber-500 transition-all" 
                      placeholder="Paste Link..." 
                      value={tempLink} 
                      onChange={e => setTempLink(e.target.value)} 
                    />
                    <button type="button" onClick={addLinkToGallery} className="bg-white text-black px-6 rounded-xl font-black text-[10px] uppercase hover:bg-amber-500 transition-colors">Add</button>
                </div>

                <div className="max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                    <div className="grid grid-cols-4 gap-3">
                        <AnimatePresence>
                            {project.projectImages?.map((img, i) => (
                                <motion.div key={img.url + i} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative aspect-square rounded-xl overflow-hidden group border border-white/5 bg-zinc-900">
                                    <img src={img.url} className="w-full h-full object-cover" alt={`Gallery item ${i + 1}`} />
                                    <button 
                                      type="button" 
                                      onClick={() => removeImage(i)} 
                                      aria-label={`Remove image ${i + 1}`}
                                      className="absolute inset-0 bg-red-600/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
             </div>

             <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-8 bg-amber-500 text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-full hover:bg-white transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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