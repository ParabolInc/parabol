import React from 'react'
import GitHubSVG from '../../../GitHubSVG'
import JiraSVG from '../../../JiraSVG'
import GitLabSVG from '../../../GitLabSVG'
import AzureDevOpsSVG from '../../../AzureDevOpsSVG'
import JiraServerSVG from '../../../JiraServerSVG'
import {Activity, ACTIVITY_TYPE_DATA_LOOKUP} from '../hooks/useActivityDetails'
import clsx from 'clsx'

interface Props {
  className?: string
  type: Activity['type']
}

export const IntegrationsTip = (props: Props) => {
  const {className, type} = props

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
        <b>Tip:</b> {ACTIVITY_TYPE_DATA_LOOKUP.integrationsTip[type]}
      </div>
    </div>
  )
}
