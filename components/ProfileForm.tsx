import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Search, ChevronDown } from 'lucide-react';

interface Props {
  onSubmit: (profile: StudentProfile) => void;
  isLoading: boolean;
}

// List of common academic majors
const MAJORS_LIST = [
  "Computer Science", "Artificial Intelligence", "Data Science", "Electrical Engineering", 
  "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Biomedical Engineering",
  "Physics", "Mathematics", "Statistics", "Biology", "Chemistry", "Neuroscience",
  "Psychology", "Economics", "Business Administration", "Finance", "Marketing",
  "Political Science", "International Relations", "History", "Philosophy", "English Literature",
  "Sociology", "Anthropology", "Architecture", "Design", "Environmental Science", "Medicine"
];

const ProfileForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    major: '',
    degreeLevel: '',
    gpa: '',
    researchInterests: '',
    targetDegree: 'PhD',
    targetLocations: '',
    experience: ''
  });

  const [majorSearch, setMajorSearch] = useState('');
  const [showMajorList, setShowMajorList] = useState(false);

  const filteredMajors = MAJORS_LIST.filter(m => 
    m.toLowerCase().includes(majorSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the search text if no selection was made but text exists
    const finalMajor = profile.major || majorSearch;
    onSubmit({ ...profile, major: finalMajor });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-black mb-4 tracking-tight">
                Academic Match<span className="font-bold">Pro</span>
            </h1>
            <p className="text-zinc-500 font-light text-lg">
                Precision matching for Graduate & PhD candidates.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all">
            <div className="p-8 space-y-8">
                
                {/* Section 1: Identity */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-100 pb-2">Candidate Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-2">Full Name</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none transition-colors rounded-sm text-sm"
                                placeholder="e.g. Alex Chen"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-2">Target Degree</label>
                            <div className="relative">
                                <select
                                    name="targetDegree"
                                    value={profile.targetDegree}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none appearance-none rounded-sm text-sm cursor-pointer"
                                >
                                    <option value="Masters">Master's (M.S. / M.A.)</option>
                                    <option value="PhD">PhD / Doctorate</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Education */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-100 pb-2">Academic Background</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="relative">
                            <label className="block text-xs font-bold text-black uppercase mb-2">Major / Discipline</label>
                            <input
                                type="text"
                                value={majorSearch}
                                onChange={(e) => {
                                    setMajorSearch(e.target.value);
                                    setShowMajorList(true);
                                    setProfile({...profile, major: ''}); // clear selection on type
                                }}
                                onFocus={() => setShowMajorList(true)}
                                onBlur={() => setTimeout(() => setShowMajorList(false), 200)} // Delay to allow click
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none transition-colors rounded-sm text-sm"
                                placeholder="Search major..."
                                required={!profile.major}
                            />
                            {showMajorList && majorSearch && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-black max-h-48 overflow-y-auto shadow-lg">
                                    {filteredMajors.map((m) => (
                                        <div
                                            key={m}
                                            className="px-3 py-2 text-sm hover:bg-zinc-100 cursor-pointer text-zinc-800"
                                            onClick={() => {
                                                setProfile({ ...profile, major: m });
                                                setMajorSearch(m);
                                                setShowMajorList(false);
                                            }}
                                        >
                                            {m}
                                        </div>
                                    ))}
                                    {filteredMajors.length === 0 && (
                                        <div className="px-3 py-2 text-xs text-zinc-400">
                                            Custom major: "{majorSearch}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-black uppercase mb-2">Degree Type</label>
                             <input
                                required
                                type="text"
                                name="degreeLevel"
                                value={profile.degreeLevel}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none transition-colors rounded-sm text-sm"
                                placeholder="e.g. B.S."
                             />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-2">GPA / Grading Scale</label>
                        <input
                            required
                            type="text"
                            name="gpa"
                            value={profile.gpa}
                            onChange={handleChange}
                            className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none transition-colors rounded-sm text-sm"
                            placeholder="e.g. 3.8/4.0 or First Class Honours"
                        />
                    </div>
                </div>

                {/* Section 3: Research */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-100 pb-2">Research Profile</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-2">Detailed Research Interests</label>
                            <textarea
                                required
                                name="researchInterests"
                                value={profile.researchInterests}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none transition-colors rounded-sm resize-none text-sm"
                                placeholder="Specific topics (e.g. Bayesian Optimization, Urban Heat Islands, CRISPR-Cas9)..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-2">Relevant Experience</label>
                            <textarea
                                required
                                name="experience"
                                value={profile.experience}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none transition-colors rounded-sm resize-none text-sm"
                                placeholder="Publications, internships, thesis work..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-black uppercase mb-2">Preferred Locations</label>
                            <input
                                required
                                type="text"
                                name="targetLocations"
                                value={profile.targetLocations}
                                onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black focus:bg-white outline-none transition-colors rounded-sm text-sm"
                                placeholder="e.g. USA (Northeast), UK, Switzerland"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-50 px-8 py-6 border-t border-zinc-200 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white text-sm font-medium py-3 px-8 rounded-sm transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            Find Matches
                        </>
                    )}
                </button>
            </div>
        </form>
    </div>
  );
};

export default ProfileForm;