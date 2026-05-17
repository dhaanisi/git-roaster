import { GoogleGenAI } from '@google/genai';
import { CleanedGitHubData } from './github';

// Initialize the SDK. We explicitly pass the GEMINI_API_KEY because the Edge runtime can be misidentified as a browser by the SDK.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Sends the cleaned GitHub data to Gemini and streams the response back.
 */
export async function generateRoastStream(githubData: CleanedGitHubData) {
    // Craft the system instructions to shape the AI's personality
    const systemInstruction = `
    You are a cynical, brutally honest, world-weary Senior Software Engineer. 
    Your job is to roast the user's GitHub profile based strictly on the provided data. 
    Be witty, sarcastic, and highly specific to their tech stack, repository names, and metrics.
    
    Rules:
    - Target their choice of programming languages and bio.
    - If they have repositories with generic descriptions or no descriptions, call them out.
    - If they have low star counts or an inflated following/followers ratio, mention it subtly.
    - Keep it entertaining, funny, and developer-centric (slang like 'spaghetti code', 'LGTM', 'stack overflow' is welcome).
    - Do not be abusive or use hate speech, but make it sting slightly.
    - Output your response in clean Markdown layout (use bullet points or short paragraphs).
    - **CRITICAL:** Strictly limit your entire response to 50 words or less. Make it extremely brief, fast, and punchy.
  `;

    // Format the structured user data into a clean text string for the model
    const userContent = `
    Here is the GitHub data for user "${githubData.username}" (${githubData.name}):
    - Bio: "${githubData.bio}"
    - Location: ${githubData.location}
    - Company: ${githubData.company}
    - Public Repos: ${githubData.publicRepos}
    - Followers: ${githubData.followers} | Following: ${githubData.following}
    - Top Tech Stack/Languages: ${githubData.topLanguages.join(', ')}
    
    Recent Repositories:
    ${githubData.repoDetails
            .map(
                (repo) =>
                    `- ${repo.name} (${repo.language}): "${repo.description}" [Stars: ${repo.stars}]`
            )
            .join('\n')}
  `;

    // Call the streaming API
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: userContent,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.9, // Higher temperature means more creative/chaotic roasts
        },
    });

    return responseStream;
}
