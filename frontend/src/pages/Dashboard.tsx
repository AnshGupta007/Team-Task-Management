import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/tasks.api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  LayoutDashboard, CheckCircle2, Clock, AlertTriangle, FolderKanban,
  ListTodo, Loader2, Activity, TrendingUp, Plus, UserPlus, ArrowRight,
} from 'lucide-react';
import { formatRelativeTime, activityLabels, getInitials } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = ['#64748b', '#3b82f6', '#22c55e'];
const PRIORITY_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

function ChartSkeletonDonut() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] animate-skeleton-pulse">
      <svg width="160" height="160" viewBox="0 0 160 160" className="opacity-30" style={{ color: 'var(--text-muted)' }}>
        <circle cx="80" cy="80" r="52" fill="none" stroke="currentColor" strokeWidth="16" strokeDasharray="8 6" />
        <circle cx="80" cy="80" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 4" />
      </svg>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Add tasks to see chart</p>
    </div>
  );
}

function ChartSkeletonBars() {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] animate-skeleton-pulse">
      <svg width="180" height="160" viewBox="0 0 180 160" className="opacity-25" style={{ color: 'var(--text-muted)' }}>
        <rect x="18" y="80" width="28" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" />
        <rect x="58" y="40" width="28" height="110" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" />
        <rect x="98" y="60" width="28" height="90" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" />
        <rect x="138" y="100" width="28" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" />
      </svg>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Add team members to see chart</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, index }: {
  label: string; value: number; icon: React.ElementType; color: string; index: number;
}) {
  return (
    <div
      className="card p-5 transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-4">
        <div
          className="p-3 rounded-xl shrink-0 transition-transform duration-200"
          style={{ background: color + '15' }}
        >
          <Icon className="w-5 h-5" style={{ color, fill: color + '25' }} />
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-110"
      style={{ color: 'var(--text-secondary)' }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full transition-all duration-200 hover:scale-150 hover:shadow-lg"
        style={{ background: color, boxShadow: `0 0 6px ${color}40` }}
      />
      {label} <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  const stats = data?.stats;
  const activity = data?.recentActivity || [];

  const statusData = [
    { name: 'To Do', value: stats?.tasksByStatus.todo || 0 },
    { name: 'In Progress', value: stats?.tasksByStatus.inProgress || 0 },
    { name: 'Done', value: stats?.tasksByStatus.done || 0 },
  ];
  const hasStatusData = statusData.some((d) => d.value > 0);

  const priorityData = [
    { name: 'Low', value: stats?.tasksByPriority.low || 0 },
    { name: 'Medium', value: stats?.tasksByPriority.medium || 0 },
    { name: 'High', value: stats?.tasksByPriority.high || 0 },
    { name: 'Critical', value: stats?.tasksByPriority.critical || 0 },
  ];
  const hasPriorityData = priorityData.some((d) => d.value > 0);

  const memberData = stats?.tasksPerMember?.map((m) => ({
    name: m.name.split(' ')[0],
    tasks: m.count,
  })) || [];
  const hasMemberData = memberData.length > 0;

  const tooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <LayoutDashboard className="w-6 h-6" style={{ color: 'var(--primary)' }} /> Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Overview of your tasks and projects</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          <TrendingUp className="w-3.5 h-3.5" />
          {stats?.totalTasks || 0} total tasks
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: ListTodo, color: '#6366f1' },
          { label: 'Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: '#8b5cf6' },
          { label: 'My Tasks', value: stats?.myTasks || 0, icon: CheckCircle2, color: '#3b82f6' },
          { label: 'Due Soon', value: stats?.dueSoonTasks || 0, icon: Clock, color: '#f59e0b' },
          { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertTriangle, color: '#ef4444' },
        ].map((card, i) => <StatCard key={card.label} {...card} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 transition-all duration-200 hover:shadow-lg" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Tasks by Status
          </h3>
          {hasStatusData ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {statusData.map((s, i) => <LegendItem key={s.name} label={s.name} value={s.value} color={STATUS_COLORS[i]} />)}
              </div>
            </>
          ) : (
            <ChartSkeletonDonut />
          )}
        </div>

        <div className="card p-5 transition-all duration-200 hover:shadow-lg" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Tasks per Member
          </h3>
          {hasMemberData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={memberData}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartSkeletonBars />
          )}
        </div>

        <div className="card p-5 transition-all duration-200 hover:shadow-lg" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            Tasks by Priority
          </h3>
          {hasPriorityData ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {priorityData.map((_, i) => <Cell key={i} fill={PRIORITY_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {priorityData.map((p, i) => <LegendItem key={p.name} label={p.name} value={p.value} color={PRIORITY_COLORS[i]} />)}
              </div>
            </>
          ) : (
            <ChartSkeletonDonut />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Recent Activity
          </h3>
          {activity.length > 0 ? (
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {activity.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-[var(--surface-hover)] hover:scale-[1.005]"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5 ring-2 ring-[var(--surface)]"
                    style={{ background: 'var(--primary-gradient)' }}
                  >
                    {getInitials(a.user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      <span className="font-semibold">{a.user.name}</span>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{activityLabels[a.action] || a.action}</span>
                    </p>
                    {a.details && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.details}</p>}
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-hover)' }}>
                <Activity className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No activity yet</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Create a project to get started!</p>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
            >
              <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                <Plus className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">Create New Project</span>
              <ArrowRight className="w-4 h-4 opacity-60" />
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
            >
              <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                <UserPlus className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">Invite a Member</span>
              <ArrowRight className="w-4 h-4 opacity-60" />
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}
            >
              <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                <FolderKanban className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">Browse Projects</span>
              <ArrowRight className="w-4 h-4 opacity-60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
