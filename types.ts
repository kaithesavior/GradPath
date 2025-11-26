
export interface StudentProfile {
  name: string;
  major: string;
  degreeLevel: string;
  gpa: string;
  researchInterests: string;
  targetDegree: 'Masters' | 'PhD';
  targetLocations: string;
  experience: string;
}

export interface SupervisorMatch {
  id: string; // Unique ID for list management
  name: string;
  university: string;
  department: string;
  researchArea: string;
  matchReason: string;
  matchScore: number; // 0-100
  websiteUrl: string; 
  recentPaper?: string;
}

export interface ProgramMatch {
  id: string; // Unique ID
  university: string;
  programName: string;
  degree: string;
  focus: string;
  matchReason: string;
  matchScore: number; // 0-100
  websiteUrl: string;
}

export interface SearchResult {
  supervisors: SupervisorMatch[];
  programs: ProgramMatch[];
  generalAdvice: string;
  groundingLinks: { title: string; uri: string }[];
}

export enum AppState {
  FORM = 'FORM',
  LOADING = 'LOADING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}
