
import React, { useState } from 'react';
import { SearchResult, StudentProfile, AppState, SupervisorMatch, ProgramMatch } from './types';
import { findRecommendations } from './services/geminiService';
import ProfileForm from './components/ProfileForm';
import ProfessorCard from './components/ProfessorCard';
import ProgramCard from './components/ProgramCard';
import { LayoutGrid, ArrowLeft, ExternalLink, Info, Plus, Heart, X, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.FORM);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile | null>(null);
  
  // Accumulated lists
  const [allSupervisors, setAllSupervisors] = useState<SupervisorMatch[]>([]);
  const [allPrograms, setAllPrograms] = useState<ProgramMatch[]>([]);
  
  // Liked IDs
  const [likedSupervisorIds, setLikedSupervisorIds] = useState<Set<string>>(new Set());
  const [likedProgramIds, setLikedProgramIds] = useState<Set<string>>(new Set());
  
  const [generalAdvice, setGeneralAdvice] = useState<string>("");
  const [groundingLinks, setGroundingLinks] = useState<{ title: string; uri: string }[]>([]);
  
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);

  const handleProfileSubmit = async (profile: StudentProfile) => {
    setCurrentProfile(profile);
    setAppState(AppState.LOADING);
    setErrorMsg('');
    setAllSupervisors([]);
    setAllPrograms([]);

    try {
      const data = await findRecommendations(profile);
      setAllSupervisors(data.supervisors);
      setAllPrograms(data.programs);
      setGeneralAdvice(data.generalAdvice);
      setGroundingLinks(data.groundingLinks);
      setAppState(AppState.RESULTS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleLoadMore = async () => {
    if (!currentProfile) return;
    setIsLoadingMore(true);
    
    // Extract existing names to avoid duplicates
    const existingSupNames = allSupervisors.map(s => s.name);
    const existingProgNames = allPrograms.map(p => p.programName);

    try {
      const data = await findRecommendations(currentProfile, existingSupNames, existingProgNames);
      setAllSupervisors(prev => [...prev, ...data.supervisors]);
      setAllPrograms(prev => [...prev, ...data.programs]);
      
      // Merge unique grounding links
      const newLinks = [...groundingLinks, ...data.groundingLinks];
      const uniqueLinks = Array.from(new Map(newLinks.map((item) => [item.uri, item])).values());
      setGroundingLinks(uniqueLinks);
      
    } catch (err) {
      console.error("Failed to load more", err);
      // Optional: show a toast or small error
    } finally {
      setIsLoadingMore(false);
    }
  };

  const toggleLikeSupervisor = (id: string) => {
    setLikedSupervisorIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleLikeProgram = (id: string) => {
    setLikedProgramIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleReset = () => {
    setAppState(AppState.FORM);
    setAllSupervisors([]);
    setAllPrograms([]);
    setLikedSupervisorIds(new Set());
    setLikedProgramIds(new Set());
    setGroundingLinks([]);
  };

  // Derived state for saved items
  const savedSupervisors = allSupervisors.filter(s => likedSupervisorIds.has(s.id));
  const savedPrograms = allPrograms.filter(p => likedProgramIds.has(p.id));
  const savedCount = savedSupervisors.length + savedPrograms.length;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-24 relative overflow-x-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 py-4 transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
            <div 
                className="flex items-center gap-3 cursor-pointer group" 
                onClick={handleReset}
            >
                <div className="bg-black text-white p-1.5 rounded-sm group-hover:bg-zinc-800 transition-colors">
                    <LayoutGrid className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg tracking-tight">GradPath.ai</span>
            </div>
            
            <div className="flex items-center gap-4">
                {appState === AppState.RESULTS && (
                    <>
                        <button 
                            onClick={() => setShowSavedDrawer(true)}
                            className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black border border-zinc-200 px-3 py-2 rounded-sm hover:bg-zinc-50 transition-colors"
                        >
                            <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                            Saved
                            {savedCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {savedCount}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={handleReset}
                            className="hidden md:flex text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors items-center gap-2"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            New Search
                        </button>
                    </>
                )}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        
        {appState === AppState.FORM && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <ProfileForm onSubmit={handleProfileSubmit} isLoading={false} />
            </div>
        )}

        {appState === AppState.LOADING && (
            <div className="flex flex-col items-center justify-center pt-20 animate-in fade-in duration-700">
                <div className="w-16 h-16 border-4 border-zinc-100 border-t-black rounded-full animate-spin mb-8"></div>
                <h2 className="text-3xl font-light text-black mb-2">Analyzing Profile</h2>
                <p className="text-zinc-500 font-light">
                    Locating matches in {currentProfile?.major}...
                </p>
            </div>
        )}

        {appState === AppState.ERROR && (
            <div className="max-w-lg mx-auto text-center pt-20">
                <div className="border border-red-200 bg-red-50 text-red-800 p-6 rounded-sm mb-6">
                    <p className="font-medium">{errorMsg}</p>
                </div>
                <button 
                    onClick={() => setAppState(AppState.FORM)}
                    className="text-sm font-bold border-b border-black pb-0.5 hover:text-zinc-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )}

        {appState === AppState.RESULTS && currentProfile && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-16">
                
                {/* Section: Strategy */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-3">
                         <h2 className="text-3xl font-light text-black leading-tight">
                            Strategic <br/> <span className="font-bold">Overview</span>
                         </h2>
                    </div>
                    <div className="lg:col-span-9">
                        <div className="bg-zinc-50 p-8 border border-zinc-200 rounded-sm relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-black"></div>
                            <p className="text-zinc-800 leading-relaxed text-lg font-light">
                                {generalAdvice}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section: Supervisors */}
                <div>
                    <div className="flex items-end justify-between mb-8 border-b border-zinc-200 pb-4">
                        <h3 className="text-xl font-bold text-black uppercase tracking-tight">Recommended Supervisors</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-zinc-400">{allSupervisors.length} Matches Found</span>
                        </div>
                    </div>
                    
                    {allSupervisors.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-zinc-300 rounded-sm">
                            <p className="text-zinc-500">No specific supervisors found. Try broadening your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {allSupervisors.map((match) => (
                                <ProfessorCard 
                                    key={match.id} 
                                    data={match} 
                                    profile={currentProfile}
                                    isLiked={likedSupervisorIds.has(match.id)}
                                    onToggleLike={toggleLikeSupervisor}
                                />
                            ))}
                        </div>
                    )}
                </div>

                 {/* Section: Programs */}
                 <div>
                    <div className="flex items-end justify-between mb-8 border-b border-zinc-200 pb-4">
                        <h3 className="text-xl font-bold text-black uppercase tracking-tight">Top Programs</h3>
                        <span className="text-xs font-mono text-zinc-400">{allPrograms.length} Matches Found</span>
                    </div>
                    
                    {allPrograms.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-zinc-300 rounded-sm">
                            <p className="text-zinc-500">No specific programs found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {allPrograms.map((match) => (
                                <ProgramCard 
                                    key={match.id} 
                                    data={match} 
                                    isLiked={likedProgramIds.has(match.id)}
                                    onToggleLike={toggleLikeProgram}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center pt-8">
                     <button 
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="flex items-center gap-3 bg-white border border-black px-8 py-3 rounded-sm hover:bg-black hover:text-white transition-all duration-300 disabled:opacity-50"
                     >
                        {isLoadingMore ? (
                            <div className="w-4 h-4 border-2 border-zinc-400 border-t-current rounded-full animate-spin"></div>
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        <span className="text-sm font-bold uppercase tracking-widest">Show More Results</span>
                     </button>
                </div>

                {/* Section: Sources */}
                {groundingLinks.length > 0 && (
                    <div className="pt-8 border-t border-zinc-200">
                        <div className="flex items-center gap-2 mb-4 text-zinc-400">
                            <Info className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Verified Sources</span>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {groundingLinks.map((link, i) => (
                                <a 
                                    key={i} 
                                    href={link.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-zinc-500 hover:text-black hover:underline flex items-center gap-1 transition-colors truncate max-w-xs"
                                >
                                    {link.title}
                                    <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>

      {/* Saved Drawer */}
      <div className={`fixed inset-0 z-50 transform transition-all duration-500 ${showSavedDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSavedDrawer(false)}></div>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
              <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-white sticky top-0 z-10">
                  <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                      Saved List
                  </h2>
                  <button onClick={() => setShowSavedDrawer(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              
              <div className="p-6 space-y-8">
                  {/* Saved Supervisors */}
                  <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Supervisors ({savedSupervisors.length})</h3>
                      {savedSupervisors.length === 0 ? (
                          <p className="text-sm text-zinc-400 italic">No supervisors saved yet.</p>
                      ) : (
                          <div className="space-y-3">
                              {savedSupervisors.map(s => (
                                  <div key={s.id} className="p-4 border border-zinc-100 rounded-sm hover:border-black transition-colors group">
                                      <div className="flex justify-between">
                                          <div>
                                              <p className="font-bold text-sm group-hover:underline">{s.name}</p>
                                              <p className="text-xs text-zinc-500 uppercase">{s.university}</p>
                                          </div>
                                          <button 
                                              onClick={() => toggleLikeSupervisor(s.id)}
                                              className="text-zinc-300 hover:text-red-500"
                                          >
                                              <X className="w-3 h-3" />
                                          </button>
                                      </div>
                                      {s.websiteUrl && (
                                         <a href={s.websiteUrl} target="_blank" className="mt-2 text-[10px] font-bold text-black flex items-center gap-1">
                                             VIEW PROFILE <ChevronRight className="w-3 h-3" />
                                         </a>
                                      )}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* Saved Programs */}
                   <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Programs ({savedPrograms.length})</h3>
                      {savedPrograms.length === 0 ? (
                          <p className="text-sm text-zinc-400 italic">No programs saved yet.</p>
                      ) : (
                          <div className="space-y-3">
                              {savedPrograms.map(p => (
                                  <div key={p.id} className="p-4 border border-zinc-100 rounded-sm hover:border-black transition-colors group">
                                      <div className="flex justify-between">
                                          <div>
                                              <p className="font-bold text-sm group-hover:underline">{p.university}</p>
                                              <p className="text-xs text-zinc-500 uppercase">{p.programName}</p>
                                          </div>
                                          <button 
                                              onClick={() => toggleLikeProgram(p.id)}
                                              className="text-zinc-300 hover:text-red-500"
                                          >
                                              <X className="w-3 h-3" />
                                          </button>
                                      </div>
                                      {p.websiteUrl && (
                                         <a href={p.websiteUrl} target="_blank" className="mt-2 text-[10px] font-bold text-black flex items-center gap-1">
                                             VIEW PAGE <ChevronRight className="w-3 h-3" />
                                         </a>
                                      )}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default App;
