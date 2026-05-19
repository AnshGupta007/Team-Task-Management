import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects.api';
import {
  FolderKanban, Plus, Users, CheckCircle2, Loader2, X,
} from 'lucide-react';
import { getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
];

export default function Projects() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FolderKanban className="w-6 h-6" style={{ color: 'var(--primary)' }} /> Projects
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your team projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> New Project
        </button>
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

      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((project) => {
            const progress = project.taskStats
              ? project.taskStats.total > 0
                ? Math.round((project.taskStats.done / project.taskStats.total) * 100)
                : 0
              : 0;
            return (
              <Link key={project.id} to={`/projects/${project.id}`} className="card card-hoverable p-5 block">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: project.color + '15' }}>
                    <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-xs mt-0.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{progress}% complete</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      <CheckCircle2 className="w-3 h-3 inline mr-0.5 -mt-0.5" />
                      {project.taskStats?.done || 0}/{project.taskStats?.total || 0}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--background)' }}>
                    <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, backgroundColor: project.color }} />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3.5" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{project.members.length} {project.members.length === 1 ? 'member' : 'members'}</span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 4).map((m) => (
                      <div key={m.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-semibold ring-2 ring-[var(--surface)]"
                        style={{ background: 'var(--primary-gradient)' }}
                        title={m.user.name}>
                        {getInitials(m.user.name)}
                      </div>
                    ))}
                    {project.members.length > 4 && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ring-2 ring-[var(--surface)]"
                        style={{ background: 'var(--border)', color: 'var(--text-secondary)' }}>
                        +{project.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card p-14 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-hover)' }}>
            <FolderKanban className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No projects yet</h3>
          <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-secondary)' }}>Create your first project to start managing tasks</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      )}
    </div>
  );
}
