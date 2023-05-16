import React from 'react'
import GitHubSVG from '../../../GitHubSVG'
import JiraSVG from '../../../JiraSVG'
import GitLabSVG from '../../../GitLabSVG'
import AzureDevOpsSVG from '../../../AzureDevOpsSVG'
import JiraServerSVG from '../../../JiraServerSVG'

export const IntegrationsList = () => {
  return (
    <div className='flex items-center gap-3'>
      <JiraSVG />
      <GitHubSVG />
      <JiraServerSVG />
      <GitLabSVG />
      <AzureDevOpsSVG />
    </div>
  )
}
