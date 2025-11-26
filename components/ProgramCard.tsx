
import React from 'react';
import { ProgramMatch } from '../types';
import { School, ArrowUpRight, Check, Heart } from 'lucide-react';

interface Props {
  data: ProgramMatch;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}

const ProgramCard: React.FC<Props> = ({ data, isLiked, onToggleLike }) => {
  const getScoreBadge = (score: number) => {
    if (score >= 90) return "Top Choice";
    if (score >= 80) return "Strong Fit";
    return "Good Fit";
  };

  return (
    <div className="bg-white border border-zinc-200 hover:border-black transition-all duration-300 rounded-sm flex flex-col h-full group">
      <div className="p-6 flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
           <div>
             <h3 className="text-lg font-bold text-black group-hover:underline decoration-1 underline-offset-4 pr-6">{data.university}</h3>
             <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">{data.programName}</div>
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

        <div className="w-full bg-zinc-100 h-1 mb-6 rounded-full overflow-hidden">
             <div className="bg-zinc-800 h-full" style={{ width: `${data.matchScore}%` }}></div>
        </div>

        {/* Details */}
        <div className="space-y-4 flex-1">
             <div>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Degree & Focus</h4>
                <div className="flex items-center gap-2">
                    <span className="bg-black text-white text-[10px] px-1.5 py-0.5 font-bold">{data.degree}</span>
                    <span className="text-sm font-medium text-black">{data.focus}</span>
                </div>
            </div>

            <div>
                 <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Why this program?</h4>
                 <div className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-zinc-400 mt-1 flex-shrink-0" />
                    <p className="text-xs text-zinc-600 leading-relaxed">{data.matchReason}</p>
                 </div>
            </div>
        </div>

        {/* Footer Link */}
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
                className="flex-1 flex items-center justify-between gap-2 border border-zinc-200 hover:bg-zinc-50 text-black py-2 px-3 rounded-sm text-xs font-bold transition-all"
             >
                Program Info
                <ArrowUpRight className="w-3 h-3" />
             </a>
        </div>
      </div>
    </div>
  );
};

export default ProgramCard;
