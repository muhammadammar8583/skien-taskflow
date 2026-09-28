import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleDotDashed,
  Minus,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const stats = [
  {
    label: 'Open Issues',
    value: '23',
    trend: '+12%',
    trendUp: true,
    icon: CircleDot,
    accent: 'text-violet-400',
  },
  {
    label: 'Completed This Week',
    value: '8',
    trend: '+3',
    trendUp: true,
    icon: CircleCheck,
    accent: 'text-emerald-400',
  },
  {
    label: 'Overdue',
    value: '3',
    trend: '+1',
    trendUp: false,
    icon: AlertTriangle,
    accent: 'text-red-400',
  },
  {
    label: 'Members',
    value: '5',
    trend: '0',
    trendUp: null,
    icon: Users,
    accent: 'text-sky-400',
  },
]

const activity = [
  { name: 'Sarah Chen', initials: 'SC', action: 'moved', key: 'PAY-12', detail: 'to In Progress', time: '2h ago', color: 'bg-violet-500/20 text-violet-300' },
  { name: 'John Park', initials: 'JP', action: 'created', key: 'AUTH-8', detail: '', time: '4h ago', color: 'bg-sky-500/20 text-sky-300' },
  { name: 'Mia Torres', initials: 'MT', action: 'completed', key: 'DASH-3', detail: '', time: '6h ago', color: 'bg-emerald-500/20 text-emerald-300' },
  { name: 'Leo Novak', initials: 'LN', action: 'commented on', key: 'API-21', detail: '', time: 'Yesterday', color: 'bg-amber-500/20 text-amber-300' },
  { name: 'Sarah Chen', initials: 'SC', action: 'assigned', key: 'PAY-15', detail: 'to you', time: 'Yesterday', color: 'bg-violet-500/20 text-violet-300' },
  { name: 'John Park', initials: 'JP', action: 'closed', key: 'BUG-42', detail: 'as duplicate', time: '2d ago', color: 'bg-sky-500/20 text-sky-300' },
]

type Status = 'todo' | 'in-progress' | 'in-review' | 'done'
type Priority = 'urgent' | 'high' | 'medium' | 'low'

const statusMeta: Record<Status, { label: string; dot: string; icon: typeof CircleDot }> = {
  todo: { label: 'Todo', dot: 'text-zinc-500', icon: CircleDashed },
  'in-progress': { label: 'In Progress', dot: 'text-amber-400', icon: CircleDotDashed },
  'in-review': { label: 'In Review', dot: 'text-sky-400', icon: CircleDot },
  done: { label: 'Done', dot: 'text-emerald-400', icon: CircleCheck },
}

const priorityMeta: Record<Priority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-400' },
  high: { label: 'High', color: 'text-orange-400' },
  medium: { label: 'Medium', color: 'text-amber-400' },
  low: { label: 'Low', color: 'text-zinc-500' },
}

const myIssues: { key: string; title: string; status: Status; priority: Priority }[] = [
  { key: 'AUTH-8', title: 'Refresh token rotation on session expiry', status: 'in-progress', priority: 'high' },
  { key: 'PAY-15', title: 'Handle failed Stripe webhook retries', status: 'todo', priority: 'urgent' },
  { key: 'DASH-3', title: 'Empty state for zero projects', status: 'in-review', priority: 'medium' },
  { key: 'API-21', title: 'Rate limit public endpoints', status: 'todo', priority: 'medium' },
  { key: 'BUG-42', title: 'Fix sidebar flicker on collapse', status: 'done', priority: 'low' },
]

const projects = [
  { name: 'Payments', issues: 42, progress: 65, activity: '2h ago', gradient: 'from-violet-500 to-blue-500' },
  { name: 'Authentication', issues: 18, progress: 40, activity: '5h ago', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Dashboard', issues: 27, progress: 88, activity: 'Yesterday', gradient: 'from-amber-500 to-orange-500' },
]

function TrendIndicator({ trend, up }: { trend: string; up: boolean | null }) {
  const Icon = up === null ? Minus : up ? ArrowUp : ArrowDown
  const color = up === null ? 'text-muted-foreground' : up ? 'text-emerald-400' : 'text-red-400'
  return (
    <span className={cn('flex items-center gap-0.5 text-xs font-medium', color)}>
      <Icon className="size-3" />
      {trend}
    </span>
  )
}

export function DashboardContent() {
  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-md border border-border bg-card p-4 transition-colors hover:border-violet-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted-foreground">{stat.label}</span>
              <stat.icon className={cn('size-4', stat.accent)} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">{stat.value}</span>
              <TrendIndicator trend={stat.trend} up={stat.trendUp} />
            </div>
          </div>
        ))}
      </div>

      {/* Middle section */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-5">
        {/* Recent Activity — 60% */}
        <section className="rounded-md border border-border bg-card lg:col-span-3">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Recent Activity</h2>
            <TrendingUp className="size-4 text-muted-foreground" />
          </header>
          <ul className="divide-y divide-border">
            {activity.map((item, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                <Avatar className="size-6 rounded-full">
                  <AvatarFallback className={cn('rounded-full text-[10px] font-medium', item.color)}>
                    {item.initials}
                  </AvatarFallback>
                </Avatar>
                <p className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">
                  <span className="font-medium text-foreground">{item.name.split(' ')[0]}</span> {item.action}{' '}
                  <span className="font-medium text-violet-400">{item.key}</span>
                  {item.detail ? ` ${item.detail}` : ''}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* My Issues — 40% */}
        <section className="rounded-md border border-border bg-card lg:col-span-2">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">My Issues</h2>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {myIssues.length}
            </span>
          </header>
          <ul className="divide-y divide-border">
            {myIssues.map((issue) => {
              const status = statusMeta[issue.status]
              const priority = priorityMeta[issue.priority]
              return (
                <li key={issue.key} className="flex items-center gap-2.5 px-4 py-2.5">
                  <status.icon className={cn('size-4 shrink-0', status.dot)} />
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{issue.key}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px]">{issue.title}</span>
                  <span
                    className={cn('shrink-0 text-[11px] font-medium', priority.color)}
                    title={`${priority.label} priority`}
                  >
                    {priority.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      {/* Projects */}
      <div className="mt-3">
        <h2 className="mb-3 text-sm font-medium">Projects</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.name}
              className="rounded-md border border-border bg-card p-4 transition-colors hover:border-violet-500/40"
            >
              <div className="flex items-center gap-2.5">
                <div className={cn('size-8 shrink-0 rounded-md bg-gradient-to-br', project.gradient)} aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.issues} issues</p>
                </div>
                <span className="ml-auto text-sm font-semibold">{project.progress}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Updated {project.activity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
