import type * as React from 'react'
import {cn} from '../../../../ui/cn'
import AzureDevOpsSVG from '../../../AzureDevOpsSVG'
import GitHubSVG from '../../../GitHubSVG'
import GitLabSVG from '../../../GitLabSVG'
import JiraServerSVG from '../../../JiraServerSVG'
import JiraSVG from '../../../JiraSVG'

interface Props {
  className?: string
  children: React.ReactNode
}

export const IntegrationsTip = (props: Props) => {
  const {className, children} = props

  return (
    <div className={cn('flex items-center', className)}>
      <div className='flex items-center gap-3'>
        <JiraSVG />
        <GitHubSVG />
        <JiraServerSVG />
        <GitLabSVG />
        <AzureDevOpsSVG />
      </div>
      <div className='ml-4'>
        <b>Tip:</b> {children}
      </div>
    </div>
  )
}
