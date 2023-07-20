import React from 'react'
import GitHubSVG from '../../../GitHubSVG'
import JiraSVG from '../../../JiraSVG'
import GitLabSVG from '../../../GitLabSVG'
import AzureDevOpsSVG from '../../../AzureDevOpsSVG'
import JiraServerSVG from '../../../JiraServerSVG'
import clsx from 'clsx'

interface Props {
  className?: string
  children: React.ReactNode
}

export const IntegrationsTip = (props: Props) => {
  const {className, children} = props

  return (
    <div className={clsx('flex min-w-max items-center', className)}>
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
