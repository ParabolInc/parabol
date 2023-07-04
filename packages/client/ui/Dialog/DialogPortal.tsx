import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

export const DialogPortal = ({className, ...props}: RadixDialog.DialogPortalProps) => (
  <RadixDialog.Portal className={className} {...props} />
)
