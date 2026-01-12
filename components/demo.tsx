'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function Demo() {
  const { data: session } = useSession();
  const defaultPayload = {
    githubUrl: "https://github.com/assafelovic/gpt-researcher"
  };

  const [payload, setPayload] = useState(JSON.stringify(defaultPayload, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!session) {
      setError("Please sign in to try the demo");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      const parsedPayload = JSON.parse(payload);

      const res = await fetch('/api/github-summarizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-user': session.user?.email || '',
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }

      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON or request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-balance mb-4 text-2xl md:text-3xl font-bold tracking-tight lg:text-5xl">
            Try it yourself
          </h2>
          <p className="text-pretty text-base md:text-lg text-muted-foreground">
            Test our GitHub repository analyzer API. Edit the payload and see instant results.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Request Panel */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Request</h3>
                <span className="text-xs text-muted-foreground font-mono">POST /api/github-summarizer</span>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">Payload:</label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="w-full h-32 p-3 font-mono text-sm bg-muted border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  placeholder="Enter JSON payload..."
                  disabled={!session}
                />
              </div>

              {!session ? (
                <Button asChild className="w-full" size="lg">
                  <Link href="/login">Sign In to Try Demo (5 Free Requests)</Link>
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </Button>
              )}

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-mono">{error}</p>
                </div>
              )}
            </Card>

            {/* Response Panel */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Response</h3>
                {response && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-mono">200 OK</span>
                )}
              </div>

              {!response && !loading && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p className="text-sm">Send a request to see the response</p>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {response && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {response.summary && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-primary">Summary</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{response.summary}</p>
                    </div>
                  )}

                  {response.cool_facts && response.cool_facts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 text-primary">Cool Facts</h4>
                      <ul className="space-y-2">
                        {response.cool_facts.map((fact: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{response.error}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
