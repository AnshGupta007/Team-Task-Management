import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects.api';
import {
  FolderKanban, Plus, Users, CheckCircle2, Loader2, X, Search, Clock, ArrowRight,
} from 'lucide-react';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

type FilterStatus = 'all' | 'active' | 'completed';

export default function Projects() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll().then((r) => r.data.projects),
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowCreate(false);
      setName('');
      setDescription('');
      setColor('#6366f1');
      toast.success('Project created!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create project'),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description, color });
  };

  const filtered = (data || []).filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'completed') return matchesSearch && p.taskStats && p.taskStats.total > 0 && p.taskStats.todo === 0 && p.taskStats.inProgress === 0;
    if (filter === 'active') return matchesSearch && p.taskStats && (p.taskStats.todo > 0 || p.taskStats.inProgress > 0);
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FolderKanban className="w-6 h-6" style={{ color: 'var(--primary)' }} /> Projects
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your team projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm font-semibold tracking-wide">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="Search projects..."
          />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 capitalize"
              style={{
                background: filter === f ? 'var(--primary-gradient)' : 'var(--surface)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                border: filter === f ? 'none' : '1px solid var(--border)',
                boxShadow: filter === f ? '0 4px 12px rgba(96, 165, 250, 0.3)' : undefined,
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="card p-6 w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Project</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Project name" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="What's this project about?" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Color</label>
                <div className="flex flex-wrap gap-2.5">
                  {PROJECT_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-xl transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'ring-1 ring-transparent hover:ring-[var(--border)] hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const progress = project.taskStats
              ? project.taskStats.total > 0
                ? Math.round((project.taskStats.done / project.taskStats.total) * 100)
                : 0
              : 0;
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="card card-hoverable p-5 block group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: project.color + '15' }}>
                    <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate group-hover:text-[var(--primary)] transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{progress}% complete</span>
                    <span className="font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {project.taskStats?.done || 0}/{project.taskStats?.total || 0}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: project.color,
                        boxShadow: progress > 0 ? `0 0 8px ${project.color}60` : undefined,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold ring-2 ring-[var(--surface)] transition-transform duration-200 hover:scale-110 hover:z-10 relative"
                        style={{ background: 'var(--primary-gradient)' }}
                        title={m.user.name}
                      >
                        {getInitials(m.user.name)}
                      </div>
                    ))}
                    {project.members.length > 5 && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-[var(--surface)]"
                        style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                        +{project.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : data && data.length > 0 ? (
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-hover)' }}>
            <Search className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No matching projects</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Try a different search or filter</p>
        </div>
      ) : (
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-hover)' }}>
            <FolderKanban className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No projects yet</h3>
          <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-secondary)' }}>Create your first project to start managing tasks</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold">
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      )}
    </div>
  );
}
