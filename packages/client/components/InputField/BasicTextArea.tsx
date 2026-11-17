import * as React from 'react'
import {TextareaHTMLAttributes} from 'react'
import {cn} from '../../ui/cn'
import StyledError from '../StyledError'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string | undefined | null
}

const BasicTextArea = (props: Props) => {
  const {error, className, ...rest} = props

  return (
    <React.Fragment>
      <textarea
        {...rest}
        className={cn(
          'm-0 block min-h-[5.75rem] w-full appearance-none rounded border border-hairline-field bg-surface-input px-[11px] py-[7px] font-sans text-[15px] text-fg-primary leading-6 outline-0 selection:bg-hairline-strong placeholder:text-fg-muted enabled:active:border-fg-primary enabled:focus:border-fg-primary enabled:hover:border-fg-primary disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
      {error && <StyledError>{error}</StyledError>}
    </React.Fragment>
  )
}

export default BasicTextArea
