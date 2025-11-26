
import React, { useState } from 'react';
import { SupervisorMatch, StudentProfile } from '../types';
import { Mail, BookOpen, Building2, ExternalLink, Heart } from 'lucide-react';
import { generateEmailDraft } from '../services/geminiService';

interface Props {
  data: SupervisorMatch;
  profile: StudentProfile;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}

const ProfessorCard: React.FC<Props> = ({ data, profile, isLiked, onToggleLike }) => {
  const [isDrafting, setIsDrafting] = useState(false);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  const handleDraftEmail = async () => {
    if (emailDraft) {
      setIsDrafting(!isDrafting);
      return;
    }
    
    setIsDrafting(true);
    setIsLoadingDraft(true);
    try {
      const draft = await generateEmailDraft(data.name, data.university, data.researchArea, profile);
      setEmailDraft(draft);
    } catch (e) {
      setEmailDraft("Unable to generate draft.");
    } finally {
      setIsLoadingDraft(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Top Match";
    if (score >= 80) return "Strong Match";
    return "Good Match";
  };

  return (
    <div className="bg-white border border-zinc-200 hover:border-black transition-all duration-300 rounded-sm flex flex-col h-full group relative">
      <div className="p-6 flex-1 flex flex-col">
        {/* Match Badge - Absolute Top Right of card content */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-black group-hover:underline decoration-1 underline-offset-4 pr-6">{data.name}</h3>
            <div className="flex items-center gap-2 text-zinc-600 text-xs mt-1">
              <Building2 className="w-3 h-3" />
              <span className="uppercase tracking-wide font-medium">{data.university}</span>
            </div>
             <p className="text-zinc-500 text-xs mt-0.5">{data.department}</p>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
             <div className="flex items-center gap-1 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                    data.matchScore >= 90 ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200'
                }`}>
                    {getScoreBadge(data.matchScore)}
                </span>
             </div>
             <span className="text-2xl font-light text-black">{data.matchScore}%</span>
          </div>
        </div>
        
        {/* Match Bar */}
        <div className="w-full bg-zinc-100 h-1 mb-6 rounded-full overflow-hidden">
             <div className="bg-zinc-800 h-full" style={{ width: `${data.matchScore}%` }}></div>
        </div>

        {/* Content */}
        <div className="space-y-4 flex-1">
            <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Focus Area</h4>
                <p className="text-sm font-medium text-black leading-snug">{data.researchArea}</p>
            </div>

            <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Analysis</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">
                    {data.matchReason}
                </p>
            </div>
            
            {data.recentPaper && (
            <div className="bg-zinc-50 p-3 border border-zinc-100 rounded-sm">
                <div className="flex items-start gap-2">
                    <BookOpen className="w-3 h-3 text-zinc-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-zinc-700 italic line-clamp-2">"{data.recentPaper}"</span>
                </div>
            </div>
            )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex gap-2">
           <button 
             onClick={() => onToggleLike(data.id)}
             className={`p-2 border rounded-sm transition-colors ${isLiked ? 'bg-zinc-100 border-zinc-300 text-red-600' : 'border-zinc-200 hover:bg-zinc-50 text-zinc-400 hover:text-red-500'}`}
             title="Save to favorites"
           >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
           </button>

             <a 
                href={data.websiteUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-black py-2 px-3 rounded-sm text-xs font-bold transition-all"
             >
                Visit Profile <ExternalLink className="w-3 h-3" />
             </a>

          <button
            onClick={handleDraftEmail}
            className="flex-1 flex items-center justify-center gap-2 bg-black hover:bg-zinc-800 text-white py-2 px-3 rounded-sm text-xs font-bold transition-all"
          >
            {isDrafting ? "Close" : "Draft"} <Mail className="w-3 h-3" />
          </button>
        </div>

        {isDrafting && (
          <div className="mt-4 pt-4 border-t border-zinc-100 animate-in slide-in-from-top-2 duration-300">
            {isLoadingDraft ? (
               <div className="py-8 text-center">
                 <div className="w-4 h-4 border-2 border-zinc-200 border-t-black rounded-full animate-spin mx-auto"></div>
               </div>
            ) : (
              <div className="relative">
                <textarea 
                  readOnly 
                  className="w-full h-40 p-3 bg-zinc-50 text-xs text-zinc-800 border-none resize-none focus:outline-none font-mono leading-relaxed rounded-sm"
                  value={emailDraft || ''}
                />
                <button 
                  onClick={() => {navigator.clipboard.writeText(emailDraft || ''); alert("Copied!");}}
                  className="absolute bottom-2 right-2 bg-white border border-zinc-200 text-[10px] px-2 py-1 uppercase font-bold tracking-wide hover:bg-zinc-100"
                >
                  Copy Text
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorCard;
