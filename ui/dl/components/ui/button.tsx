import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 hover:bg-gray-100',
      ghost: 'hover:bg-gray-100'
    }
    const sizes: Record<string, string> = {
      default: 'h-9 px-4 py-2 rounded-2xl',
      icon: 'h-9 w-9 flex items-center justify-center rounded-2xl'
    }
    return (
      <button
        className={cn(variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
