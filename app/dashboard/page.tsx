"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
}

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState({ name: "", key: "" });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-green-500 z-50"></div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 pt-12 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tavily AI</h1>
        </div>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 text-purple-700 font-medium"
          >
            Overview
          </Link>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-500">
            Research Assistant
          </div>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            Research Reports
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            API Playground
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            Invoices
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            Documentation
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 pt-1">
        {/* Top Bar Right Section */}
        <div className="fixed top-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center justify-end gap-4 px-6 z-40">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Operational</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
          <button className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded">
            50%
          </button>
        </div>

        {/* Main Content Area */}
        <div className="pt-12 px-8 pb-8">
          {/* Breadcrumb */}
          <div className="mb-4">
            <nav className="text-sm text-gray-600">
              <span>Pages</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">Overview</span>
            </nav>
          </div>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Overview</h1>

          {/* Current Plan Card */}
          <div className="mb-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium opacity-90">CURRENT PLAN</span>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Manage Plan
              </button>
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
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              The key is used to authenticate your requests to the Research API. To learn more, see the{" "}
              <a href="#" className="text-purple-600 hover:underline">Research API</a> link and{" "}
              <a href="#" className="text-purple-600 hover:underline">documentation page</a> link.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading API keys...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No API keys yet. Create your first one to get started.</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Create API Key
                </button>
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
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">NAME</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                        AGE
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">KEY</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OPTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{apiKey.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{getAge(apiKey.createdAt)}</td>
                        <td className="py-4 px-4" style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
                          <code className="text-sm font-mono text-gray-700 whitespace-nowrap block overflow-hidden text-ellipsis" style={{ maxWidth: '100%' }}>
                            {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
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
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(apiKey.id)}
                              className="text-gray-600 hover:text-red-600 transition-colors"
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

          {/* Support Section */}
         
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingKey ? "Edit API Key" : "Create New API Key"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="My API Key"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) =>
                        setFormData({ ...formData, key: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, key: generateApiKey() })}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      title="Generate new key"
                    >
                      🔄
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(formData.key)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    {editingKey ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
