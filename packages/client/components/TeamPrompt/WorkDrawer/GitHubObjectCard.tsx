import React from 'react'
import gitHubSVG from '../../../styles/theme/images/graphics/github-circle.svg'
import gitHubMerged from '../../../styles/theme/images/graphics/github-merged.svg'
import githubIssueClosed from '../../../styles/theme/images/graphics/github-issue-closed.svg'
import githubIssueOpen from '../../../styles/theme/images/graphics/github-issue-open.svg'
import githubPROpen from '../../../styles/theme/images/graphics/github-pr-open.svg'
import relativeDate from '../../../utils/date/relativeDate'

const ISSUE_STATUS_MAP: Record<string, any> = {
  OPEN: githubIssueOpen,
  CLOSED: githubIssueClosed
}

const PR_STATUS_MAP: Record<string, any> = {
  OPEN: githubPROpen,
  MERGED: gitHubMerged
}

interface Props {
  type: 'issue' | 'pr'
  title: string
  status: string
  number: number
  repoName: string
  url: string
  updatedAt: string
}

const GitHubObjectCard = (props: Props) => {
  const {title, status, number, repoName, type, updatedAt} = props
  const statusImg = type === 'issue' ? ISSUE_STATUS_MAP[status] : PR_STATUS_MAP[status]
  return (
    <div className='rounded border border-solid border-slate-300 p-4'>
      <div className='flex gap-2 text-xs text-slate-600'>
        {statusImg && <img src={statusImg} />}
        <div className='font-medium'>#{number}</div>
        <div>Updated {relativeDate(updatedAt)}</div>
      </div>
      <div className='my-2 text-sm'>{title}</div>
      <div className='flex items-center gap-2'>
        <div className='h-4 w-4'>
          <img src={gitHubSVG} />
        </div>
        <div className='text-xs text-slate-600'>{repoName}</div>
      </div>
    </div>
  )
}

export default GitHubObjectCard
