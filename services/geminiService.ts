import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz, Message, MindMap, Resource } from "../types";

export interface GeneratedStudyPlan {
  courseName: string;
  description: string;
  prerequisites: string[];
  phases: {
    title: string;
    topics: {
      text: string;
      resources: Resource[];
    }[];
  }[];
}

export const generateStudyPlan = async (subject: string): Promise<GeneratedStudyPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Act as an expert curriculum designer. Create a comprehensive, step-by-step study plan for the topic: "${subject}".
The plan should be broken down into logical weekly phases.
For each phase, provide a checklist of specific topics or tasks.
For each topic, research the web and provide 2-4 diverse, high-quality learning resources. Include a variety of types like 'Article', 'Video', 'GitHub' for code examples, 'Documentation', and 'Paid Course' for structured learning.

Provide the following in JSON format:
1. 'courseName': A professional name for the study plan.
2. 'description': A brief, motivating overview.
3. 'prerequisites': A list of essential skills required.
4. 'phases': An array of weekly phases. Each phase object should contain:
    a. 'title': A descriptive title for the phase (e.g., "Week 1-2: Core Concepts").
    b. 'topics': An array of checklist items for that phase. Each topic should include:
        i. 'text': A concise, actionable description of the topic.
        ii. 'resources': A list of resources. Each resource must have: 'title', 'url', and 'type' ('Paid Course', 'Video', 'Article', 'GitHub', etc.).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseName: { type: Type.STRING, description: "The name of the course or study plan." },
            description: { type: Type.STRING, description: "A brief overview of the course." },
            prerequisites: {
              type: Type.ARRAY,
              description: "A list of prerequisite skills.",
              items: { type: Type.STRING },
            },
            phases: {
              type: Type.ARRAY,
              description: "A list of weekly phases for the study plan.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Title of the phase, e.g., 'Week 1-2'." },
                  topics: {
                    type: Type.ARRAY,
                    description: "A list of topics/tasks for this phase.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING, description: "The checklist item text." },
                        resources: {
                          type: Type.ARRAY,
                          description: "A list of learning resources for the topic.",
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              url: { type: Type.STRING },
                              type: { 
                                type: Type.STRING, 
                                enum: ['Paid Course', 'Free Course', 'Article', 'Video', 'Documentation', 'Book', 'GitHub'] 
                              },
                            },
                            required: ["title", "url", "type"],
                          },
                        },
                      },
                      required: ["text", "resources"],
                    },
                  },
                },
                required: ["title", "topics"],
              },
            },
          },
          required: ["courseName", "description", "prerequisites", "phases"],
        },
      },
    });

    const jsonText = response.text.trim();
    const studyPlan: GeneratedStudyPlan = JSON.parse(jsonText);
    return studyPlan;
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate detailed study plan. The AI may be busy or the topic is too complex. Please try again.");
  }
};


export const generateQuiz = async (noteContent: string): Promise<Quiz> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanContent = noteContent.replace(/<[^>]*>?/gm, ' '); // Strip HTML tags

    const prompt = `Based on the following study note content, generate a short multiple-choice quiz with 3-5 questions to test understanding. For each question, provide 4 options and indicate the index of the correct answer.

Note Content: "${cleanContent}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    questions: {
                      type: Type.ARRAY,
                      description: "A list of quiz questions.",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          question: { type: Type.STRING, description: "The question text." },
                          options: { 
                            type: Type.ARRAY, 
                            description: "An array of 4 possible answers.",
                            items: { type: Type.STRING } 
                          },
                          answer: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array." }
                        },
                        required: ["question", "options", "answer"]
                      }
                    }
                  },
                  required: ["questions"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const quiz: Quiz = JSON.parse(jsonText);
        return quiz;

    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz. The AI might be having trouble with the content.");
    }
};

export const summarizeNote = async (noteContent: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanContent = noteContent.replace(/<[^>]*>?/gm, ' ');

    const prompt = `Please provide a concise summary of the following study note. Focus on the key points and main ideas. The summary should be a single paragraph.

Note Content: "${cleanContent}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text.trim();

    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Failed to generate summary. The AI might be having trouble with the content.");
    }
};

export const continueConversation = async (
  history: Message[],
  newMessage: string,
  context: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-pro';

  const systemInstruction = `You are StudyMaster Pro's friendly AI companion. Your role is to be a supportive and knowledgeable study partner. You are encouraging, patient, and smart.
- Answer questions related to study topics clearly and concisely.
- If a user seems stuck or frustrated, offer motivational support.
- Keep your responses helpful and focused on learning.
- The user is currently on the "${context}" tab of the application. Use this context to better understand their questions, but don't state it unless it's directly relevant to the answer.`;

  try {
    const chatHistory = history.slice(0, -1);
    
    const chat = ai.chats.create({
        model,
        config: {
            systemInstruction,
        },
        history: chatHistory,
    });
    
    const response = await chat.sendMessage({ message: newMessage });

    return response.text.trim();

  } catch (error) {
    console.error("Error in conversation:", error);
    throw new Error("I'm having trouble connecting right now. Please try again in a moment.");
  }
};

// FIX: Corrected a malformed try-catch block that was causing a syntax error.
export const explainConcept = async (concept: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Please explain the following concept in a simple and easy-to-understand way. Use an analogy if it helps.

Concept: "${concept}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error explaining concept:", error);
        throw new Error("Failed to get explanation. The AI might be having trouble with the content.");
    }
};

// FIX: Corrected an incomplete GoogleGenAI constructor call. The code was mangled with the function above.
export const generateWeeklyReport = async (stats: { time: number, tasks: number, achievements: number }): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the following weekly study statistics, generate a friendly and motivational "Weekly Review" report in Markdown format. The report should include:
1.  A positive opening.
2.  A summary of the stats provided.
3.  An encouraging observation about their progress.
4.  One actionable suggestion for the upcoming week.

Stats:
- Total Study Time: ${stats.time} hours
- Tasks Completed: ${stats.tasks}
- Achievements Unlocked: ${stats.achievements}
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating report:", error);
        throw new Error("Failed to generate weekly report.");
    }
};

export const generateMindMapFromNote = async (noteTitle: string, noteContent: string): Promise<Omit<MindMap, 'noteId' | 'noteTitle'>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanContent = noteContent.replace(/<[^>]*>?/gm, ' ');

    const prompt = `Analyze the following study note and generate a hierarchical mind map structure from it. The root node should be the main topic. Create child nodes for key concepts and further sub-nodes for details. Provide a list of nodes (with id, label, and level) and a list of edges (with from and to ids) to represent the connections. The note title is "${noteTitle}".

Note Content: "${cleanContent}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        nodes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    label: { type: Type.STRING },
                                    level: { type: Type.INTEGER },
                                },
                                required: ["id", "label", "level"],
                            },
                        },
                        edges: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    from: { type: Type.STRING },
                                    to: { type: Type.STRING },
                                },
                                required: ["from", "to"],
                            },
                        },
                    },
                    required: ["nodes", "edges"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating mind map:", error);
        throw new Error("Failed to generate mind map.");
    }
};

export const critiqueFeynmanExplanation = async (concept: string, explanation: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a helpful tutor. I am using the Feynman Technique to learn.
My student-like explanation of a concept is below. Please analyze it and provide feedback in Markdown format.
- Point out any inaccuracies or parts that are confusing.
- Ask a clarifying question to test my understanding of a key area.
- Keep your tone encouraging and constructive.

Original Concept from my notes: "${concept}"

My Explanation: "${explanation}"`;

    try {
        const response = await ai.models.generateContent({ model: "gemini-2.5-pro", contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error critiquing explanation:", error);
        throw new Error("Failed to get feedback from the AI tutor.");
    }
};

export const processImportedContent = async (content: string): Promise<{ title: string; summary: string; tags: string[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analyze the following block of text, which is likely from a web article or document. Based on the content, please:
1.  Generate a concise, descriptive title.
2.  Write a brief one-paragraph summary.
3.  Suggest 3-5 relevant tags as a list of strings.

Text Content: "${content}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ["title", "summary", "tags"],
                },
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error processing imported content:", error);
        throw new Error("Failed to process the imported text.");
    }
};

export const getPrerequisiteResources = async (skill: string): Promise<Resource[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Act as an expert learning advisor. For the specific skill or prerequisite "${skill}", research and suggest 3-5 high-quality, diverse learning resources. 
  Include a variety of free resources like Articles, Videos, and official Documentation. If applicable, also include top-rated Paid Courses.
  
  Provide the response in JSON format as an array of resource objects. 
  Each resource object must have a 'title', a valid 'url', and a 'type' from the allowed list.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              url: { type: Type.STRING },
              type: { 
                type: Type.STRING, 
                enum: ['Paid Course', 'Free Course', 'Article', 'Video', 'Documentation', 'Book', 'GitHub'] 
              },
            },
            required: ["title", "url", "type"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const resources: Resource[] = JSON.parse(jsonText);
    return resources;
  } catch (error) {
    console.error("Error generating prerequisite resources:", error);
    throw new Error(`Failed to find resources for "${skill}". The AI may be busy, or the topic is too niche. Please try again.`);
  }
};
