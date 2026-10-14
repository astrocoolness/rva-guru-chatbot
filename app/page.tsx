'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';

interface Project {
  id: number;
  name: string;
  description?: string;
  system_prompt?: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: { projectId: activeProject },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createProject = async () => {
    if (!newName.trim()) return;
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    const p = await res.json();
    setProjects([p, ...projects]);
    setActiveProject(p.id);
    setNewName('');
    setMessages([]);
  };

  const selectProject = (id: number) => {
    setActiveProject(id);
    setMessages([]);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all overflow-hidden bg-zinc-900 border-r border-zinc-800 flex flex-col`}>
        <div className="p-4 border-b border-zinc-800">
          <h1 className="font-semibold text-lg">Projects</h1>
          <div className="mt-3 flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New project name"
              className="flex-1 bg-zinc-800 rounded px-3 py-1.5 text-sm outline-none"
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
            />
            <button onClick={createProject} className="bg-blue-600 hover:bg-blue-500 px-3 rounded text-sm">
              +
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProject(p.id)}
              className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-800 ${activeProject === p.id ? 'bg-zinc-800' : ''}`}
            >
              <div className="font-medium">{p.name}</div>
              {p.description && <div className="text-zinc-400 text-xs truncate">{p.description}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-zinc-800 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-400 hover:text-white">
            ☰
          </button>
          <span className="font-medium">
            {activeProject ? projects.find((p) => p.id === activeProject)?.name : 'Select or create a project'}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-zinc-500 mt-20">
              <p className="text-lg">RVA Guru Chatbot</p>
              <p className="text-sm mt-1">Powered by Grok · No login required</p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  m.role === 'user' ? 'bg-blue-600' : 'bg-zinc-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Message Grok..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-zinc-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-white text-black px-5 rounded-xl font-medium disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
