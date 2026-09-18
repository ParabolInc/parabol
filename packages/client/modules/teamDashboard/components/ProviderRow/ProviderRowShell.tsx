import type * as React from 'react'
import {cn} from '../../../../ui/cn'

interface Props {
  providerLogo: React.ReactElement
  headerClassName?: string
  children: React.ReactNode
  panel?: React.ReactNode
}

const ProviderRowShell = (props: Props) => {
  const {providerLogo, headerClassName, children, panel} = props
  return (
    <div className='relative my-4 flex w-full shrink-0 flex-col justify-start rounded-sm bg-surface-card shadow-[var(--shadow-card)]'>
      <div className={cn('flex justify-start p-row-gutter', headerClassName)}>
        {providerLogo}
        {children}
      </div>
      {panel}
    </div>
  )
}

export default ProviderRowShell
