import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { projectsApi } from '../api/projects.api';
import { tasksApi } from '../api/tasks.api';
import type { Task, TaskStatus, ProjectMember, ActivityLog } from '../types';
import {
  Plus, X, Loader2, UserPlus, Trash2, Users, Clock, AlertTriangle,
  Search, Filter, Calendar, Activity, FolderKanban,
} from 'lucide-react';
import {
  getInitials, formatDate, formatRelativeTime, priorityConfig,
  statusConfig, isOverdue, isDueSoon, activityLabels,
} from '../utils/helpers';
import toast from 'react-hot-toast';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: '#64748b' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { id: 'DONE', label: 'Done', color: '#22c55e' },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const { data, isLoading } = useQuery<any>({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: activityData } = useQuery<any>({
    queryKey: ['activity', id],
    queryFn: () => projectsApi.getActivity(id!).then((r) => r.data.activities),
    enabled: !!id && showActivity,
  });

  const isAdmin = data?.userRole === 'ADMIN';
  const project = data?.project;
  const tasks: Task[] = project?.tasks || [];
  const members: ProjectMember[] = project?.members || [];

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    if (filterAssignee && t.assignedToId !== filterAssignee) return false;
    return true;
  });

  const groupedTasks: Record<TaskStatus, Task[]> = {
    TODO: filteredTasks.filter((t) => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === 'IN_PROGRESS'),
    DONE: filteredTasks.filter((t) => t.status === 'DONE'),
  };

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      tasksApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.create(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowCreateTask(false);
      resetTaskForm();
      toast.success('Task created!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task deleted');
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: (email: string) => projectsApi.addMember(id!, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowAddMember(false);
      setMemberEmail('');
      toast.success('Member added!');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Member removed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const resetTaskForm = () => {
    setTaskTitle(''); setTaskDesc(''); setTaskPriority('MEDIUM');
    setTaskDueDate(''); setTaskAssignee('');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as TaskStatus;
    const taskId = result.draggableId;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    statusMutation.mutate({ taskId, status: newStatus });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      title: taskTitle,
      description: taskDesc || undefined,
      priority: taskPriority,
      dueDate: taskDueDate || undefined,
      assignedToId: taskAssignee || undefined,
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} /></div>;
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-hover)' }}>
          <FolderKanban className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: project.color + '20' }}>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: project.color }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{project.name}</h1>
            {project.description && <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowActivity(!showActivity)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showActivity ? 'bg-indigo-500/10 text-indigo-500' : 'hover:bg-[var(--surface-hover)]'
            }`}
            style={{ border: '1px solid var(--border)', color: showActivity ? undefined : 'var(--text-secondary)' }}>
            <Activity className="w-4 h-4" /> Activity
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setShowAddMember(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-[var(--surface-hover)]"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <UserPlus className="w-4 h-4" /> Add Member
              </button>
              <button onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-500/25">
                <Plus className="w-4 h-4" /> New Task
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card p-3 flex flex-wrap items-center gap-2">
        <Users className="w-4 h-4 ml-1 shrink-0" style={{ color: 'var(--text-muted)' }} />
        {members.map((m: ProjectMember) => (
          <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
            style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-semibold shrink-0"
              style={{ backgroundColor: m.user.avatar || '#6366f1' }}>
              {getInitials(m.user.name)}
            </div>
            {m.user.name.split(' ')[0]}
            {m.role === 'ADMIN' && <span className="text-indigo-500 font-semibold ml-0.5">★</span>}
            {isAdmin && m.role !== 'ADMIN' && (
              <button onClick={() => removeMemberMutation.mutate(m.userId)} className="ml-1 p-0.5 rounded hover:bg-red-500/20 transition-colors">
                <X className="w-3 h-3 text-red-400" />
              </button>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No members yet</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="Search tasks..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-indigo-500/30"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
            <option value="">All Members</option>
            {members.map((m: ProjectMember) => <option key={m.userId} value={m.userId}>{m.user.name.split(' ')[0]}</option>)}
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{col.label}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full ml-auto" style={{ background: col.color + '15', color: col.color }}>
                  {groupedTasks[col.id].length}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 min-h-[120px] rounded-lg p-1 transition-colors"
                    style={{ background: snapshot.isDraggingOver ? 'var(--surface-hover)' : 'transparent' }}
                  >
                    {groupedTasks[col.id].length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: 'var(--surface-hover)' }}>
                          <Plus className="w-4 h-4" />
                        </div>
                        No tasks
                      </div>
                    )}
                    {groupedTasks[col.id].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 rounded-lg transition-all hover:shadow-md"
                            style={{
                              ...provided.draggableProps.style,
                              background: 'var(--background)',
                              border: '1px solid var(--border)',
                              boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : undefined,
                            }}
                          >
                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityConfig[task.priority].class}`}>
                                {priorityConfig[task.priority].label}
                              </span>
                              {task.dueDate && isOverdue(task.dueDate) && task.status !== 'DONE' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                                </span>
                              )}
                              {task.dueDate && isDueSoon(task.dueDate) && task.status !== 'DONE' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" /> Due soon
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                            {task.description && (
                              <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                              <div className="flex items-center gap-1.5">
                                {task.assignedTo ? (
                                  <div className="flex items-center gap-1">
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-semibold"
                                      style={{ backgroundColor: task.assignedTo.avatar || '#6366f1' }}>
                                      {getInitials(task.assignedTo.name)}
                                    </div>
                                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{task.assignedTo.name.split(' ')[0]}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {task.dueDate && (
                                  <span className="text-[10px] flex items-center gap-0.5" style={{ color: isOverdue(task.dueDate) && task.status !== 'DONE' ? '#ef4444' : 'var(--text-muted)' }}>
                                    <Calendar className="w-2.5 h-2.5" />
                                    {formatDate(task.dueDate)}
                                  </span>
                                )}
                                {isAdmin && (
                                  <button onClick={() => deleteTaskMutation.mutate(task.id)} className="p-1 rounded hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur" onClick={() => setShowCreateTask(false)}>
          <div className="card p-6 w-full max-w-md animate-scale-in shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Task</h2>
              <button onClick={() => setShowCreateTask(false)} className="p-1 rounded-md hover:bg-[var(--surface-hover)] transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Title *</label>
                <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Task title" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
                <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Describe the task..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Priority</label>
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-indigo-500/30"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Due Date</label>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30"
                    style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Assign To</label>
                <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer transition-all focus:ring-2 focus:ring-indigo-500/30"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">Unassigned</option>
                  {members.map((m: ProjectMember) => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                </select>
              </div>
              <button type="submit" disabled={createTaskMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25">
                {createTaskMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur" onClick={() => setShowAddMember(false)}>
          <div className="card p-6 w-full max-w-sm animate-scale-in shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Add Member</h2>
              <button onClick={() => setShowAddMember(false)} className="p-1 rounded-md hover:bg-[var(--surface-hover)] transition-colors">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addMemberMutation.mutate(memberEmail); }} className="space-y-4">
              <input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="Enter member's email" type="email" required />
              <button type="submit" disabled={addMemberMutation.isPending}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25">
                {addMemberMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Add Member
              </button>
            </form>
          </div>
        </div>
      )}

      {showActivity && (
        <div className="card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Activity className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Activity Log
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activityData?.map((a: ActivityLog) => (
              <div key={a.id} className="flex items-start gap-2.5 px-2 py-2 rounded-lg text-xs transition-colors hover:bg-[var(--surface-hover)]">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-semibold shrink-0 mt-0.5 ring-2 ring-[var(--surface)]"
                  style={{ backgroundColor: a.user.avatar || '#6366f1' }}>
                  {getInitials(a.user.name)}
                </div>
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.user.name}</span>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>{activityLabels[a.action] || a.action}</span>
                  {a.details && <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.details}</p>}
                  <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {(!activityData || activityData.length === 0) && (
              <div className="text-center py-6">
                <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
