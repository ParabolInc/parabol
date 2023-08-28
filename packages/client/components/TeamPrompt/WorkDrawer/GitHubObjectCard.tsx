import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import gitHubSVG from '../../../styles/theme/images/graphics/github-circle.svg'
import gitHubMerged from '../../../styles/theme/images/graphics/github-merged.svg'
import githubIssueClosed from '../../../styles/theme/images/graphics/github-issue-closed.svg'
import githubIssueOpen from '../../../styles/theme/images/graphics/github-issue-open.svg'
import githubPROpen from '../../../styles/theme/images/graphics/github-pr-open.svg'
import githubPRDraft from '../../../styles/theme/images/graphics/github-pr-draft.svg'
import githubPRClosed from '../../../styles/theme/images/graphics/github-pr-closed.svg'
import relativeDate from '../../../utils/date/relativeDate'
import {Link} from '@mui/icons-material'
import useTooltip from '../../../hooks/useTooltip'
import {MenuPosition} from '../../../hooks/useCoords'

const ISSUE_STATUS_MAP: Record<string, any> = {
  OPEN: githubIssueOpen,
  CLOSED: githubIssueClosed
}

const PR_STATUS_MAP: Record<string, any> = {
  OPEN: githubPROpen,
  DRAFT: githubPRDraft,
  CLOSED: githubPRClosed,
  MERGED: gitHubMerged
}

interface Props {
  type: 'issue' | 'pullRequest'
  title: string
  status: string
  number: number
  repoName: string
  repoUrl: string
  url: string
  updatedAt: string
  prIsDraft: boolean
}

const GitHubObjectCard = (props: Props) => {
  const {title, status, number, repoName, repoUrl, url, type, updatedAt, prIsDraft} = props
  const modifiedStatus = prIsDraft && status === 'OPEN' ? 'DRAFT' : status
  const statusImg =
    type === 'issue' ? ISSUE_STATUS_MAP[modifiedStatus] : PR_STATUS_MAP[modifiedStatus]

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  return (
    <div className='rounded border border-solid border-slate-300 p-4'>
      <div className='flex gap-2 text-xs text-slate-600'>
        {statusImg && <img src={statusImg} />}
        <a href={url} target='_blank' className='font-medium hover:underline' rel='noreferrer'>
          #{number}
        </a>
        <div>Updated {relativeDate(updatedAt)}</div>
      </div>
      <div className='my-2 text-sm'>
        <a href={url} target='_blank' className='hover:underline' rel='noreferrer'>
          {title}
        </a>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4'>
            <img src={gitHubSVG} />
          </div>
          <a
            href={repoUrl}
            target='_blank'
            className='text-xs text-slate-600 hover:underline'
            rel='noreferrer'
          >
            {repoName}
          </a>
        </div>
        <CopyToClipboard text={url}>
          <div
            className='h-6 rounded-full bg-transparent p-0 text-slate-500 hover:bg-slate-200'
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            ref={originRef}
          >
            <Link className='h-6 w-6 cursor-pointer p-0.5' />
          </div>
        </CopyToClipboard>
        {tooltipPortal('Copy link')}
      </div>
    </div>
  )
}

export default GitHubObjectCard
