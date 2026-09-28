'use client'

import { useState } from 'react'
import {
  Plus,
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  SignalHigh,
  SignalMedium,
  SignalLow,
  AlertTriangle,
  MinusCircle,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type Priority = 'urgent' | 'high' | 'medium' | 'low'

type Issue = {
  id: string
  key: string
  title: string
  priority: Priority
  assignee: { name: string; avatar?: string }
  due?: { label: string; overdue?: boolean }
  comments?: number
}

type ColumnId = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'

type Column = {
  id: ColumnId
  name: string
  accent: string
  limit?: number
}

const columns: Column[] = [
  { id: 'backlog', name: 'Backlog', accent: 'bg-zinc-500' },
  { id: 'todo', name: 'Todo', accent: 'bg-zinc-300' },
  { id: 'in_progress', name: 'In Progress', accent: 'bg-yellow-400', limit: 5 },
  { id: 'done', name: 'Done', accent: 'bg-violet-500' },
  { id: 'canceled', name: 'Canceled', accent: 'bg-zinc-600' },
]

const priorityConfig: Record<Priority, { icon: LucideIcon; className: string; label: string }> = {
  urgent: { icon: AlertTriangle, className: 'text-red-500', label: 'Urgent' },
  high: { icon: SignalHigh, className: 'text-orange-400', label: 'High' },
  medium: { icon: SignalMedium, className: 'text-yellow-400', label: 'Medium' },
  low: { icon: SignalLow, className: 'text-zinc-500', label: 'Low' },
}

const initialIssues: Record<ColumnId, Issue[]> = {
  backlog: [
    { id: '1', key: 'PAY-31', title: 'Support multi-currency payouts', priority: 'medium', assignee: { name: 'Sarah Chen' }, comments: 2 },
    { id: '2', key: 'PAY-30', title: 'Investigate failed refund edge cases', priority: 'high', assignee: { name: 'John Doe' } },
    { id: '3', key: 'PAY-28', title: 'Add idempotency keys to charge endpoint', priority: 'urgent', assignee: { name: 'Mia Wong' }, due: { label: 'Oct 12' }, comments: 5 },
    { id: '4', key: 'PAY-27', title: 'Document webhook retry behavior', priority: 'low', assignee: { name: 'Leo Park' } },
    { id: '5', key: 'PAY-25', title: 'Migrate legacy tokens to vault', priority: 'medium', assignee: { name: 'Sarah Chen' }, comments: 1 },
    { id: '6', key: 'PAY-24', title: 'Rate limit dispute submissions', priority: 'low', assignee: { name: 'John Doe' } },
    { id: '7', key: 'PAY-22', title: 'Audit PCI logging surfaces', priority: 'high', assignee: { name: 'Mia Wong' } },
    { id: '8', key: 'PAY-21', title: 'Backfill invoice metadata', priority: 'low', assignee: { name: 'Leo Park' } },
  ],
  todo: [
    { id: '9', key: 'PAY-19', title: 'Wire up Apple Pay express checkout', priority: 'high', assignee: { name: 'Sarah Chen' }, due: { label: 'Oct 9' }, comments: 3 },
    { id: '10', key: 'PAY-18', title: 'Add retry banner to failed payments UI', priority: 'medium', assignee: { name: 'Leo Park' } },
    { id: '11', key: 'PAY-16', title: 'Validate SCA challenge redirects', priority: 'urgent', assignee: { name: 'Mia Wong' }, due: { label: 'Oct 3', overdue: true }, comments: 4 },
    { id: '12', key: 'PAY-15', title: 'Expose settlement report export', priority: 'low', assignee: { name: 'John Doe' } },
    { id: '13', key: 'PAY-14', title: 'Cache exchange rates for 60s', priority: 'medium', assignee: { name: 'Sarah Chen' } },
  ],
  in_progress: [
    { id: '14', key: 'PAY-12', title: 'Fix Stripe webhook signature verification', priority: 'urgent', assignee: { name: 'Sarah Chen' }, due: { label: 'Oct 5' }, comments: 6 },
    { id: '15', key: 'PAY-11', title: 'Build subscription proration preview', priority: 'high', assignee: { name: 'Leo Park' }, comments: 2 },
    { id: '16', key: 'PAY-9', title: 'Handle partial capture on auth holds', priority: 'medium', assignee: { name: 'Mia Wong' } },
  ],
  done: [
    { id: '17', key: 'PAY-8', title: 'Add 3D Secure fallback flow', priority: 'high', assignee: { name: 'John Doe' }, comments: 1 },
    { id: '18', key: 'PAY-7', title: 'Persist customer payment methods', priority: 'medium', assignee: { name: 'Sarah Chen' } },
    { id: '19', key: 'PAY-6', title: 'Instrument checkout funnel events', priority: 'low', assignee: { name: 'Leo Park' } },
    { id: '20', key: 'PAY-5', title: 'Encrypt PAN at rest', priority: 'urgent', assignee: { name: 'Mia Wong' } },
    { id: '21', key: 'PAY-4', title: 'Add webhook signing secret rotation', priority: 'high', assignee: { name: 'John Doe' }, comments: 3 },
    { id: '22', key: 'PAY-3', title: 'Ship refund API v2', priority: 'medium', assignee: { name: 'Sarah Chen' } },
  ],
  canceled: [
    { id: '23', key: 'PAY-2', title: 'Prototype crypto payments', priority: 'low', assignee: { name: 'Leo Park' } },
    { id: '24', key: 'PAY-1', title: 'Integrate deprecated Sources API', priority: 'low', assignee: { name: 'John Doe' } },
  ],
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
}

function IssueCard({ issue, dragging, onDragStart, onDragEnd }: {
  issue: Issue
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const priority = priorityConfig[issue.priority]
  const PriorityIcon = priority.icon

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'group cursor-grab rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 transition-all active:cursor-grabbing',
        'hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900',
        dragging && 'opacity-40',
      )}
    >
      <div className="flex items-center gap-1.5">
        <PriorityIcon className={cn('size-3.5 shrink-0', priority.className)} strokeWidth={2.5} aria-label={priority.label} />
        <span className="font-mono text-[11px] text-muted-foreground">{issue.key}</span>
      </div>

      <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-foreground">{issue.title}</p>

      <div className="mt-2 flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarImage src={issue.assignee.avatar || '/placeholder.svg'} alt={issue.assignee.name} />
          <AvatarFallback className="bg-violet-500/20 text-[10px] text-violet-300">
            {initials(issue.assignee.name)}
          </AvatarFallback>
        </Avatar>

        {issue.due && (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[11px]',
              issue.due.overdue ? 'bg-red-500/15 text-red-400' : 'bg-zinc-800 text-muted-foreground',
            )}
          >
            {issue.due.label}
          </span>
        )}

        {issue.comments ? (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
            <MessageSquare className="size-3.5" />
            {issue.comments}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export function KanbanBoard() {
  const [issues, setIssues] = useState(initialIssues)
  const [view, setView] = useState<'board' | 'list'>('board')
  const [dragging, setDragging] = useState<{ id: string; from: ColumnId } | null>(null)
  const [dropTarget, setDropTarget] = useState<ColumnId | null>(null)

  function handleDrop(target: ColumnId) {
    if (!dragging) return
    const { id, from } = dragging
    if (from !== target) {
      setIssues((prev) => {
        const card = prev[from].find((i) => i.id === id)
        if (!card) return prev
        return {
          ...prev,
          [from]: prev[from].filter((i) => i.id !== id),
          [target]: [card, ...prev[target]],
        }
      })
    }
    setDragging(null)
    setDropTarget(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Project top bar */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-800 px-4">
        <h1 className="text-sm font-semibold text-foreground">Payments Integration</h1>
        <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          PAY
        </span>

        <div className="ml-2 flex items-center rounded-md border border-zinc-800 p-0.5">
          <button
            onClick={() => setView('board')}
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-1 text-[13px] transition-colors',
              view === 'board' ? 'bg-zinc-800 text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="size-3.5" />
            Board
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-1 text-[13px] transition-colors',
              view === 'list' ? 'bg-zinc-800 text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List className="size-3.5" />
            List
          </button>
        </div>

        <Button variant="outline" size="sm" className="h-7 gap-1.5 border-zinc-800 bg-transparent text-[13px]">
          <Filter className="size-3.5" />
          Filter
        </Button>

        <Button size="sm" className="ml-auto h-7 gap-1.5 text-[13px]">
          <Plus className="size-3.5" />
          New Issue
        </Button>
      </div>

      {/* Board */}
      {view === 'board' ? (
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-4">
          {columns.map((col) => {
            const colIssues = issues[col.id]
            const overLimit = col.limit != null && colIssues.length > col.limit
            return (
              <section
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDropTarget(col.id)
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setDropTarget(null)
                }}
                onDrop={() => handleDrop(col.id)}
                className={cn(
                  'flex w-72 shrink-0 flex-col rounded-lg border border-zinc-800 bg-zinc-900/60 transition-colors',
                  dropTarget === col.id && 'border-violet-500/60 bg-zinc-900',
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <span className={cn('size-2 rounded-full', col.accent)} />
                  <h2 className="text-[13px] font-medium text-foreground">{col.name}</h2>
                  {col.limit ? (
                    <span
                      className={cn(
                        'rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] tabular-nums',
                        overLimit ? 'text-red-400' : 'text-muted-foreground',
                      )}
                    >
                      {colIssues.length}/{col.limit}
                    </span>
                  ) : (
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                      {colIssues.length}
                    </span>
                  )}
                  <button
                    className="ml-auto flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-zinc-800 hover:text-foreground"
                    aria-label={`Add issue to ${col.name}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                  {colIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      dragging={dragging?.id === issue.id}
                      onDragStart={() => setDragging({ id: issue.id, from: col.id })}
                      onDragEnd={() => {
                        setDragging(null)
                        setDropTarget(null)
                      }}
                    />
                  ))}
                  {colIssues.length === 0 && (
                    <div className="rounded-lg border border-dashed border-zinc-800 px-3 py-6 text-center text-[12px] text-muted-foreground">
                      Drop issues here
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          {columns.map((col) => (
            <div key={col.id}>
              <div className="flex items-center gap-2 px-1 py-2">
                <span className={cn('size-2 rounded-full', col.accent)} />
                <h2 className="text-[13px] font-medium">{col.name}</h2>
                <span className="text-[12px] text-muted-foreground">{issues[col.id].length}</span>
              </div>
              <ul className="mb-2">
                {issues[col.id].map((issue) => {
                  const priority = priorityConfig[issue.priority]
                  const PriorityIcon = priority.icon
                  return (
                    <li
                      key={issue.id}
                      className="flex items-center gap-3 rounded-md border border-transparent px-2 py-1.5 hover:border-zinc-800 hover:bg-zinc-900"
                    >
                      <PriorityIcon className={cn('size-3.5 shrink-0', priority.className)} strokeWidth={2.5} />
                      <span className="w-16 shrink-0 font-mono text-[11px] text-muted-foreground">{issue.key}</span>
                      <span className="flex-1 truncate text-[13px]">{issue.title}</span>
                      {issue.due && (
                        <span className={cn('text-[11px]', issue.due.overdue ? 'text-red-400' : 'text-muted-foreground')}>
                          {issue.due.label}
                        </span>
                      )}
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-violet-500/20 text-[10px] text-violet-300">
                          {initials(issue.assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
