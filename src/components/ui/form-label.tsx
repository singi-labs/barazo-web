import { cn } from '@/lib/utils'

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  optional?: boolean
  block?: boolean
}

export function FormLabel({
  required,
  optional,
  block = true,
  children,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn(block && 'block', 'text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-destructive">
          *
        </span>
      )}
      {optional && (
        <span className="ml-1.5 text-xs font-normal text-muted-foreground">(optional)</span>
      )}
    </label>
  )
}
