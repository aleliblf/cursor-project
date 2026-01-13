import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { checkAndIncrementRateLimit } from '@/lib/utils/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    const demoUser = request.headers.get('x-demo-user');
    
    console.log('Validating API key:', apiKey ? `${apiKey.substring(0, 10)}...` : (demoUser ? 'demo mode' : 'empty'));

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
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

    // Check if this is a demo request
    let isDemoRequest = false;
    let demoUserEmail = '';
    let currentDemoUsage = 0;
    
    if (!apiKey && demoUser) {
      console.log('Demo request from:', demoUser);
      isDemoRequest = true;
      demoUserEmail = demoUser;
      
      // Check demo usage limit
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('demo_usage')
        .eq('email', demoUser)
        .single();

      console.log('User data query result:', { userData, userError });

      if (userError) {
        console.error('Error fetching user:', userError);
        return NextResponse.json(
          { error: 'Authentication error' },
          { status: 401 }
        );
      }

      currentDemoUsage = userData?.demo_usage || 0;
      const DEMO_LIMIT = 5;

      console.log(`Current demo usage: ${currentDemoUsage}/${DEMO_LIMIT}`);

      if (currentDemoUsage >= DEMO_LIMIT) {
        return NextResponse.json(
          { error: 'Demo request limit exceeded' },
          { status: 429 }
        );
      }

      console.log(`Demo usage: ${currentDemoUsage}/${DEMO_LIMIT} (will increment on success)`);
    } else if (!apiKey) {
      console.log('No API key or demo user provided');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    } else {
      // Check rate limit and increment usage
      console.log('Checking rate limit for key:', apiKey.substring(0, 10) + '...');
      const rateLimitResult = await checkAndIncrementRateLimit(apiKey);

      if (!rateLimitResult.allowed) {
        if (rateLimitResult.error === 'Rate limit exceeded') {
          console.log(`Rate limit exceeded: ${rateLimitResult.usage}/${rateLimitResult.limit}`);
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded', 
              usage: rateLimitResult.usage,
              limit: rateLimitResult.limit
            },
            { status: 429 }
          );
        }
        
        console.log('Rate limit check failed:', rateLimitResult.error);
        return NextResponse.json(
          { error: rateLimitResult.error || 'Invalid API key' },
          { status: 401 }
        );
      }

      console.log(`Rate limit check passed: ${rateLimitResult.usage}/${rateLimitResult.limit}`);
    }

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

      // Increment demo usage only on successful completion
      if (isDemoRequest && demoUserEmail) {
        console.log('Attempting to increment demo usage for:', demoUserEmail);
        console.log('Current usage before increment:', currentDemoUsage);
        
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ demo_usage: currentDemoUsage + 1 })
          .eq('email', demoUserEmail)
          .select();
        
        if (updateError) {
          console.error('Failed to increment demo usage:', updateError);
        } else {
          console.log('Demo usage update result:', updateData);
          console.log(`Demo usage incremented: ${currentDemoUsage + 1}/5`);
        }
      }

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

      // Increment demo usage even for fallback response (user still got a result)
      if (isDemoRequest && demoUserEmail) {
        console.log('Attempting to increment demo usage for fallback response:', demoUserEmail);
        
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ demo_usage: currentDemoUsage + 1 })
          .eq('email', demoUserEmail)
          .select();
        
        if (updateError) {
          console.error('Failed to increment demo usage:', updateError);
        } else {
          console.log('Demo usage update result:', updateData);
          console.log(`Demo usage incremented (fallback): ${currentDemoUsage + 1}/5`);
        }
      }

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
