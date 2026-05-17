// Define a strict TypeScript interface for the data we want to send to the AI
export interface CleanedGitHubData {
    username: string;
    name: string;
    bio: string;
    publicRepos: number;
    followers: number;
    following: number;
    company: string;
    location: string;
    blog: string;
    topLanguages: string[];
    repoDetails: { name: string; description: string; stars: number; language: string }[];
}

/**
 * Fetches public data for a given GitHub username and cleans it up for the LLM.
 */
export async function fetchGitHubProfile(username: string): Promise<CleanedGitHubData> {
    // Optional: Add your GitHub Personal Access Token to .env.local to avoid low rate limits
    const headers: HeadersInit = {
        Accept: "application/vnd.github+json",
    };

    if (process.env.GITHUB_PAT) {
        headers["Authorization"] = `Bearer ${process.env.GITHUB_PAT}`;
    }

    // 1. Fetch User Profile Base Data
    const profileResponse = await fetch(`https://api.github.com/users/${username}`, { headers });

    if (!profileResponse.ok) {
        if (profileResponse.status === 404) {
            throw new Error("GitHub user not found. Did you spell it right?");
        }
        throw new Error("Failed to fetch GitHub profile data.");
    }

    const profile = await profileResponse.json();

    // 2. Fetch User's Repositories (Sorted by recent updates, max 30)
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers });
    let repos = [];
    if (reposResponse.ok) {
        repos = await reposResponse.json();
    }

    // 3. Process Repositories & Extract Top Languages
    const languagesMap: Record<string, number> = {};

    const repoDetails = repos.map((repo: any) => {
        if (repo.language) {
            languagesMap[repo.language] = (languagesMap[repo.language] || 0) + 1;
        }
        return {
            name: repo.name,
            description: repo.description || "No description provided (classic).",
            stars: repo.stargazers_count,
            language: repo.language || "Unknown",
        };
    });

    // Sort languages by frequency to find their primary stack
    const topLanguages = Object.keys(languagesMap)
        .sort((a, b) => languagesMap[b] - languagesMap[a])
        .slice(0, 5);

    // 4. Return the distilled payload
    return {
        username: profile.login,
        name: profile.name || profile.login,
        bio: profile.bio || "No bio written.",
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        company: profile.company || "Unemployed / Freelance",
        location: profile.location || "Unknown",
        blog: profile.blog || "No website",
        topLanguages,
        repoDetails: repoDetails.slice(0, 10), // Limit to top 10 repos so we don't blow up AI token limits
    };
}