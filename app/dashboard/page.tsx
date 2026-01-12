"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSession, signIn, signOut } from "next-auth/react";
import { Header } from "@/components/hero";
import { Button } from "@/components/ui/button";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({ name: "", key: "" });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validateKey, setValidateKey] = useState("");
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);

  const generateApiKey = () => {
    return `leli_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  // Load API keys from Supabase
  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Map database fields to component format
      const mappedKeys: ApiKey[] = (data || []).map((key: any) => ({
        id: key.id,
        name: key.name,
        key: key.key,
        createdAt: key.created_at,
      }));

      setApiKeys(mappedKeys);
    } catch (err: any) {
      console.error('Error loading API keys:', err);
      setError(err.message || 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const getAge = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return "****";
    return key.substring(0, 4) + "**********";
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const handleOpenModal = (key?: ApiKey) => {
    if (key) {
      setEditingKey(key);
      setFormData({ name: key.name, key: key.key });
    } else {
      setEditingKey(null);
      setFormData({ name: "", key: generateApiKey() });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingKey(null);
    setFormData({ name: "", key: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingKey) {
        // Update existing key
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({
            name: formData.name,
            key: formData.key,
          })
          .eq('id', editingKey.id);

        if (updateError) throw updateError;
      } else {
        // Create new key
        const { error: insertError } = await supabase
          .from('api_keys')
          .insert([
            {
              name: formData.name,
              key: formData.key,
            },
          ]);

        if (insertError) throw insertError;
      }

      // Reload keys from database
      await loadApiKeys();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving API key:', err);
      setError(err.message || 'Failed to save API key');
      alert(err.message || 'Failed to save API key. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      try {
        setError(null);
        const { error: deleteError } = await supabase
          .from('api_keys')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        // Reload keys from database
        await loadApiKeys();
      } catch (err: any) {
        console.error('Error deleting API key:', err);
        setError(err.message || 'Failed to delete API key');
        alert(err.message || 'Failed to delete API key. Please try again.');
      }
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    alert("API key copied to clipboard!");
  };

  const handleValidateKey = async () => {
    if (!validateKey.trim()) {
      setValidationResult({ isValid: false, message: "Please enter an API key" });
      return;
    }

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: validateKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult({ isValid: true, message: "Valid API key" });
      } else {
        setValidationResult({ isValid: false, message: data.error || "Invalid API key" });
      }
    } catch (err) {
      setValidationResult({ isValid: false, message: "Invalid API key" });
    }
  };

  const closeValidationPopup = () => {
    setValidationResult(null);
    setValidateKey("");
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
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">API Key Management</h1>
            <p className="text-muted-foreground">Manage your API keys and monitor usage</p>
          </div>

          {/* Current Plan Card */}
          <div className="mb-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium opacity-90">CURRENT PLAN</span>
              <Button 
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Manage Plan
              </Button>
            </div>
            <h2 className="text-3xl font-bold mb-4">Researcher</h2>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <span>API Limit</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold mt-1">24/1,000 Requests</p>
          </div>

          {/* API Keys Section */}
          <div className="bg-card rounded-lg border border-border p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-card-foreground">API Keys</h2>
              <Button
                onClick={() => handleOpenModal()}
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              The key is used to authenticate your requests to the Research API. To learn more, see the{" "}
              <a href="#" className="text-primary hover:underline">Research API</a> link and{" "}
              <a href="#" className="text-primary hover:underline">documentation page</a> link.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* API Key Validation Section */}
            <div className="mb-6 p-4 bg-accent/50 border border-border rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-3">Validate API Key</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={validateKey}
                  onChange={(e) => setValidateKey(e.target.value)}
                  placeholder="Enter API key to validate"
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-sm"
                />
                <Button
                  onClick={handleValidateKey}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Validate
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No API keys yet. Create your first one to get started.</p>
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create API Key
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: 'auto' }} />
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '320px' }} />
                    <col style={{ width: '128px' }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">NAME</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                        AGE
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">KEY</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">OPTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="border-b border-border/50 hover:bg-accent/30">
                        <td className="py-4 px-4 text-sm text-foreground">{apiKey.name}</td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{getAge(apiKey.createdAt)}</td>
                        <td className="py-4 px-4" style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
                          <code className="text-sm font-mono text-foreground whitespace-nowrap block overflow-hidden text-ellipsis" style={{ maxWidth: '100%' }}>
                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title={visibleKeys.has(apiKey.id) ? "Hide key" : "Show key"}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {visibleKeys.has(apiKey.id) ? (
                                  <>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  </>
                                ) : (
                                  <>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </>
                                )}
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenModal(apiKey)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(apiKey.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Validation Result Popup */}
      {validationResult && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-sm w-full mx-4 border border-border">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                {validationResult.isValid ? (
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className={`text-xl font-bold text-center mb-2 ${validationResult.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {validationResult.message}
              </h3>
              <div className="flex justify-center mt-6">
                <Button
                  onClick={closeValidationPopup}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {editingKey ? "Edit API Key" : "Create New API Key"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="My API Key"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) =>
                        setFormData({ ...formData, key: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-sm"
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => setFormData({ ...formData, key: generateApiKey() })}
                      variant="secondary"
                      size="icon"
                      title="Generate new key"
                    >
                      🔄
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleCopy(formData.key)}
                      variant="secondary"
                      size="icon"
                      title="Copy to clipboard"
                    >
                      📋
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {editingKey ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
