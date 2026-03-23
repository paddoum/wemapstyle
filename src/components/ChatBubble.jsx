import { cn } from '@/lib/utils'

export default function ChatBubble({ role, id, children, className }) {
  const isUser = role === 'user'
  return (
    <div
      id={id}
      className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start', className)}
    >
      <div className={cn(
        'max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed',
        isUser
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      )}>
        {children}
      </div>
    </div>
  )
}
