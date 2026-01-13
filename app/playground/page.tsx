"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Header } from "@/components/hero";
import { Button } from "@/components/ui/button";
import { type ApiKey } from "@/types/api";

export default function Playground() {
  const { data: session, status } = useSession();
  const [githubUrl, setGithubUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/github-summarizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-user-email': session?.user?.email || '',
        },
        body: JSON.stringify({ githubUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to summarize repository');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 pt-20 px-4 md:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">API Playground</h1>
                <p className="text-muted-foreground">Test your GitHub repository summarizer API</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Link>
              </Button>
            </div>
          </div>

          {/* Playground Form */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm mb-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-mono"
                  required
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Don't have an API key? <Link href="/dashboard" className="text-primary hover:underline">Create one in your dashboard</Link>
                </p>
              </div>

              <Button 
                type="submit"
                disabled={loading || !githubUrl || !apiKey}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Run API Call
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-destructive mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-destructive">Error</h3>
                  <p className="text-sm text-destructive/90">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Response Section */}
          {result && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Summary
                </h3>
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </div>

              {/* Cool Facts */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Cool Facts
                </h3>
                <ul className="space-y-3">
                  {result.cool_facts.map((fact: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-foreground flex-1">{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Raw Response */}
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-foreground mb-3">Raw JSON Response</h3>
                <div className="bg-background border border-border rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
                  <pre className="text-muted-foreground">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!result && !error && !loading && (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No results yet</h3>
              <p className="text-sm text-muted-foreground">Enter a GitHub URL and select an API key to get started</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
