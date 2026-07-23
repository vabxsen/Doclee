import { cn } from '@/lib/cn'

interface FileNameFieldProps {
  value: string
  onChange: (value: string) => void
  extension: string
  className?: string
}

/** An editable file name (base only) with its extension shown as a fixed suffix — used on every tool's result screen so the output can be renamed before saving. */
export function FileNameField({ value, onChange, extension, className }: FileNameFieldProps) {
  return (
    <div className={cn('flex w-full items-center gap-1.5', className)}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="File name"
        className="focus-ring glass h-10 min-w-0 flex-1 rounded-[14px] px-3 text-sm text-ink"
      />
      <span className="shrink-0 text-sm text-ink-muted">.{extension}</span>
    </div>
  )
}
