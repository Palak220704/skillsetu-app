import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateNcertLecture(topic, language = 'English', grade = '8') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

    const prompt = `
You are an expert NCERT master teacher for Class ${grade}.
Generate a comprehensive, highly educational 4-to-5 scene lesson script on the topic: "${topic}".
The lesson must be explained in depth in ${language}.

Return ONLY a valid JSON object matching this exact schema without any markdown formatting or backticks:
{
  "title": "Full Chapter Title",
  "summary": "Detailed 2-3 sentence overview of what students will learn in this lesson.",
  "slides": [
    {
      "heading": "Scene 1: Introduction & Core Concept",
      "narration": "A detailed 3 to 4 sentence spoken explanation explaining the foundation of this topic clearly.",
      "visualDescription": "Detailed description of diagram or formula shown on screen",
      "bulletPoints": [
        "Key point 1 explaining the concept",
        "Key point 2 explaining real-world relevance",
        "Key point 3 defining core terms"
      ]
    },
    {
      "heading": "Scene 2: In-Depth Breakdown & Process",
      "narration": "Detailed 3 to 4 sentence explanation walking through step-by-step principles and mechanics.",
      "visualDescription": "Illustration showing step-by-step process",
      "bulletPoints": [
        "Detailed sub-point 1",
        "Detailed sub-point 2",
        "Key formula, law, or mechanism"
      ]
    },
    {
      "heading": "Scene 3: Real-World Examples & Applications",
      "narration": "Detailed 3 to 4 sentence explanation linking the concept to everyday examples and exam questions.",
      "visualDescription": "Real world application diagram",
      "bulletPoints": [
        "Practical application 1",
        "Practical application 2",
        "Important exam tip"
      ]
    },
    {
      "heading": "Scene 4: Key Summary & Takeaways",
      "narration": "Concluding 3 sentence summary reiterating the most important terms to remember.",
      "visualDescription": "Summary mindmap graphic",
      "bulletPoints": [
        "Core takeaway 1",
        "Core takeaway 2",
        "Final formula / rule review"
      ]
    }
  ],
  "quizQuestions": [
    {
      "question": "Concept check question about ${topic}?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating NCERT lecture:', error);
    return {
      title: `${topic} (NCERT Class ${grade})`,
      summary: `In-depth educational lecture covering key principles and applications of ${topic}.`,
      slides: [
        {
          heading: `Introduction to ${topic}`,
          narration: `Welcome to this Class ${grade} NCERT lesson on ${topic}. In this section, we explore the fundamental definitions and core scientific principles that govern this topic.`,
          visualDescription: `Educational diagram explaining ${topic}`,
          bulletPoints: [
            `Understanding the basic definition of ${topic}`,
            `Core principles according to Class ${grade} NCERT textbook`,
            `Key terms and definitions required for board exams`
          ]
        },
        {
          heading: `Deep Dive & Key Mechanisms`,
          narration: `Let us examine how ${topic} operates in detail. Pay close attention to the step-by-step process and formulas associated with this concept.`,
          visualDescription: `Detailed process schematic for ${topic}`,
          bulletPoints: [
            `Step-by-step mechanism and working model`,
            `Important mathematical or chemical representations`,
            `Common observations and experimental results`
          ]
        },
        {
          heading: `Summary & Exam Takeaways`,
          narration: `To summarize, mastering ${topic} requires remembering these core takeaways. Practice the textbook exercise questions at the end of this chapter.`,
          visualDescription: `Summary mindmap for ${topic}`,
          bulletPoints: [
            `Key definition recap`,
            `Primary formula / law to memorize`,
            `Important NCERT exercise question review`
          ]
        }
      ]
    };
  }
}