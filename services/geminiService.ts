
import { GoogleGenAI } from "@google/genai";
import { SearchResult, SupervisorMatch, ProgramMatch, StudentProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// Helper to generate simple IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const findRecommendations = async (
    profile: StudentProfile, 
    excludeSupervisors: string[] = [], 
    excludePrograms: string[] = []
): Promise<SearchResult> => {
  
  const excludeStr = excludeSupervisors.length > 0 
    ? `Do NOT include these supervisors (you already found them): ${excludeSupervisors.join(", ")}. Find DIFFERENT ones.` 
    : "";

  const excludeProgStr = excludePrograms.length > 0
    ? `Do NOT include these programs: ${excludePrograms.join(", ")}.`
    : "";

  const prompt = `
    Act as a rigorous academic consultant.
    
    Student Profile:
    - Target Degree: ${profile.targetDegree}
    - Major/Background: ${profile.major} (${profile.degreeLevel}) - GPA: ${profile.gpa}
    - Research Interests: ${profile.researchInterests}
    - Experience: ${profile.experience}
    - Preferred Locations: ${profile.targetLocations}

    Task:
    1. Search for 10 REAL, currently active professors/supervisors who match this student's research interests. Prioritize those with active labs.
    2. Search for 10 suitable Graduate or PhD PROGRAMS.
    3. Calculate a "Match Score" (0-100) for each based on keyword overlap and specialization fit.
    4. Find the DIRECT URL for the professor's Lab page or Faculty Profile (not just the university homepage).
    5. Find the DIRECT URL for the specific Program or Department page.

    Constraint Checklist & Confidence Score:
    1. ${excludeStr}
    2. ${excludeProgStr}
    3. Ensure strictly valid JSON.

    Output Format:
    You MUST output a valid JSON object strictly adhering to this structure inside a markdown code block.
    
    CRITICAL JSON RULES:
    1. Do NOT include any comments.
    2. Escape all double quotes inside string values.
    3. Do not use unescaped newlines.
    
    {
      "supervisors": [
        {
          "name": "Name",
          "university": "University",
          "department": "Department",
          "researchArea": "Specific focus",
          "matchReason": "Brief explanation of fit",
          "matchScore": 95,
          "websiteUrl": "https://...", 
          "recentPaper": "Recent paper title (optional)"
        }
      ],
      "programs": [
        {
          "university": "University",
          "programName": "Program Name",
          "degree": "${profile.targetDegree}",
          "focus": "Lab or Track Name",
          "matchReason": "Why this program fits",
          "matchScore": 90,
          "websiteUrl": "https://..."
        }
      ],
      "generalAdvice": "Strategic advice paragraph."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const text = response.text || "";
    
    let jsonString = "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    
    if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
    } else {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            jsonString = text.substring(start, end + 1);
        }
    }

    let parsedData: { supervisors: any[], programs: any[], generalAdvice: string } = { 
        supervisors: [], 
        programs: [],
        generalAdvice: ""
    };

    try {
        if (jsonString) {
            jsonString = jsonString.replace(/[\r\n]+/g, ' ');
            parsedData = JSON.parse(jsonString);
        }
    } catch (e) {
        console.error("JSON Parse Error", e);
        if (text.length > 0 && !jsonString) {
             throw new Error("AI response was not in valid JSON format.");
        }
    }

    // Process and add IDs with URL Fallback Logic
    const supervisors: SupervisorMatch[] = (parsedData.supervisors || []).map(s => {
        // Fallback: If no valid URL, generate a specific Google Search query
        const safeUrl = (s.websiteUrl && s.websiteUrl.startsWith('http')) 
            ? s.websiteUrl 
            : `https://www.google.com/search?q=${encodeURIComponent(s.name + " " + s.university + " " + (s.department || "") + " lab profile")}`;

        return {
            ...s,
            id: generateId(),
            websiteUrl: safeUrl
        };
    });

    const programs: ProgramMatch[] = (parsedData.programs || []).map(p => {
        // Fallback: If no valid URL, generate a specific Google Search query
        const safeUrl = (p.websiteUrl && p.websiteUrl.startsWith('http'))
            ? p.websiteUrl
            : `https://www.google.com/search?q=${encodeURIComponent(p.university + " " + p.programName + " " + p.degree + " admissions")}`;
        
        return {
            ...p,
            id: generateId(),
            websiteUrl: safeUrl
        };
    });

    const groundingLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '',
      }))
      .filter((link: any) => link.uri) || [];

    const uniqueLinks = Array.from(new Map(groundingLinks.map((item: any) => [item.uri, item])).values()) as { title: string; uri: string }[];

    return {
      supervisors,
      programs,
      generalAdvice: parsedData.generalAdvice || "Strategic advice available upon request.",
      groundingLinks: uniqueLinks,
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch recommendations. Please check your connection and try again.");
  }
};

export const generateEmailDraft = async (professorName: string, university: string, topic: string, profile: StudentProfile): Promise<string> => {
    const prompt = `
      Write a polite, professional cold email from a student to a potential supervisor.
      
      Student: ${profile.name}, ${profile.major}
      Professor: ${professorName}, ${university}
      Research Interest: ${topic}
      
      Goal: Inquire about ${profile.targetDegree} opportunities.
      Tone: Academic, humble, concise, professional.
      Length: Short (under 200 words).
      
      Output only the email body text.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
      return response.text || "Could not generate email.";
    } catch (error) {
      console.error("Email Gen Error:", error);
      return "Error generating email draft.";
    }
  };
