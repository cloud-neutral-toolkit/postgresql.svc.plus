'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../../lib/utils'

export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal

export function DropdownMenuContent({ className, ...props }: DropdownMenuPrimitive.DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Content className={cn('z-50 min-w-[8rem] overflow-hidden rounded-2xl border bg-white p-1 shadow', className)} {...props} />
  )
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuPrimitive.DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Item ref={ref} className={cn('flex cursor-pointer select-none items-center rounded px-2 py-1 text-sm hover:bg-gray-100', className)} {...props} />
  )
)
DropdownMenuItem.displayName = 'DropdownMenuItem'
