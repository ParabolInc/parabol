import React, {useEffect, useRef} from 'react'
import {twMerge} from 'tailwind-merge'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({className, ...props}) => {
    const internalRef = useRef<HTMLTextAreaElement>(null)

    // Set the cursor to the end once the component is mounted
    useEffect(() => {
      const textarea = internalRef.current
      if (textarea) {
        const length = textarea.value.length
        textarea.focus()
        textarea.setSelectionRange(length, length)
      }
    }, [])

    return (
      <textarea
        className={twMerge(
          'flex h-24 w-full rounded border border-slate-500 bg-transparent px-2 py-1 text-sm focus:outline-none focus-visible:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-slate-600',
          className
        )}
        ref={internalRef}
        {...props}
      />
    )
  }
)
