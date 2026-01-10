import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    
    console.log('Validating API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'empty');

    if (!apiKey) {
      console.log('No API key provided');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Validate API key in database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // @ts-ignore
            agent: undefined
          });
        }
      }
    });

    console.log('Querying database for key:', apiKey.trim());
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', apiKey.trim())
      .maybeSingle();

    console.log('Query result - data:', apiKeyData ? 'found' : 'not found', 'error:', apiKeyError);

    if (apiKeyError) {
      console.error('Supabase error:', apiKeyError);
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    if (!apiKeyData) {
      console.log('No matching API key found');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    console.log('Valid API key found:', apiKeyData.name);

    // Get GitHub URL from request body
    const body = await request.json();
    const { githubUrl } = body;

    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }

    // Parse GitHub URL to extract owner and repo
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = githubUrl.match(githubRegex);

    if (!match) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');

    console.log('Fetching GitHub repo:', owner, '/', cleanRepo);

    // Fetch repository data from GitHub API
    const githubApiUrl = `https://api.github.com/repos/${owner}/${cleanRepo}`;
    const response = await fetch(githubApiUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'API-Key-Validator'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Repository not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch repository data' },
        { status: response.status }
      );
    }

    const repoData = await response.json();

    // Fetch README file
    console.log('Fetching README for:', owner, '/', cleanRepo);
    const readmeUrl = `https://api.github.com/repos/${owner}/${cleanRepo}/readme`;
    const readmeResponse = await fetch(readmeUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'API-Key-Validator'
      }
    });

    let readmeContent = '';

    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      // GitHub API returns README content as base64 encoded
      if (readmeData.content) {
        try {
          readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
          console.log('README fetched successfully');
        } catch (decodeError) {
          console.error('Error decoding README:', decodeError);
          readmeContent = '';
        }
      }
    } else {
      console.log('README not found or failed to fetch');
    }

    // Use Langchain to generate AI-powered summary with structured output
    console.log('Generating AI summary with Langchain...');

    // Define the output schema using Zod
    const summarySchema = z.object({
      summary: z.string().describe("A concise summary of the GitHub repository"),
      cool_facts: z.array(z.string()).describe("A list of 3-5 interesting facts about the repository")
    });

    // Initialize the LLM with structured output
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const structuredModel = model.withStructuredOutput(summarySchema);

    try {
      // Create the prompt
      const prompt = `Summarize this github repository from this readme file content.

Repository Name: ${repoData.full_name}
Repository Description: ${repoData.description || "No description available"}

README Content:
${readmeContent.substring(0, 4000)}

Provide a concise summary and 3-5 interesting facts about this repository.`;

      // Invoke the model with structured output
      const result = await structuredModel.invoke(prompt);

      console.log('AI summary generated successfully');

      return NextResponse.json({
        summary: result.summary,
        cool_facts: result.cool_facts
      }, { status: 200 });

    } catch (aiError: any) {
      console.error('AI generation error:', aiError);

      // Fallback to basic summary if AI fails
      const fallbackSummary = `${repoData.full_name} is a ${repoData.language || 'software'} project${repoData.description ? ` focused on ${repoData.description.toLowerCase()}` : ''}. It aims to ${repoData.description || 'provide solutions'} by leveraging modern technology.`;

      const fallbackFacts = [];
      if (repoData.description) fallbackFacts.push(repoData.description);
      if (repoData.topics?.length) fallbackFacts.push(`Uses ${repoData.topics.slice(0, 3).join(', ')} technologies`);
      if (repoData.stargazers_count > 100) fallbackFacts.push(`${repoData.stargazers_count} stars on GitHub`);

      return NextResponse.json({
        summary: fallbackSummary,
        cool_facts: fallbackFacts,
        warning: 'AI generation failed, using fallback'
      }, { status: 200 });
    }

  } catch (err: any) {
    console.error('Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
