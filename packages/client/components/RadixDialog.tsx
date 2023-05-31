import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import clsx from 'clsx'

const Dialog = DialogPrimitive.Root

const DialogTrigger = ({className, children, ...props}: DialogPrimitive.DialogTriggerProps) => (
  <DialogPrimitive.Trigger className={clsx('bg-transparent p-0', className)} {...props}>
    {children}
  </DialogPrimitive.Trigger>
)
const DialogPortal = ({className, children, ...props}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={clsx(className)} {...props}>
    <div className='fixed inset-0 z-40 flex items-start justify-center sm:items-center'>
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({className, ...props}, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={clsx(
      'data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in fixed inset-0 z-40 bg-slate-700/30 transition-all duration-100',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({className, children, ...props}, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={clsx(
        'bg-background animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0 fixed z-40 grid w-full gap-4 rounded-b-lg shadow-lg sm:max-w-lg sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none'>
        <span className='sr-only'>Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export {Dialog, DialogTrigger, DialogContent}
