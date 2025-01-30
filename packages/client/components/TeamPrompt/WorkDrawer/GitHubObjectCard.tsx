import {Link} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {GitHubObjectCard_result$key} from '../../../__generated__/GitHubObjectCard_result.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'
import gitHubSVG from '../../../styles/theme/images/graphics/github-circle.svg'
import githubIssueClosed from '../../../styles/theme/images/graphics/github-issue-closed.svg'
import githubIssueOpen from '../../../styles/theme/images/graphics/github-issue-open.svg'
import gitHubMerged from '../../../styles/theme/images/graphics/github-merged.svg'
import githubPRClosed from '../../../styles/theme/images/graphics/github-pr-closed.svg'
import githubPRDraft from '../../../styles/theme/images/graphics/github-pr-draft.svg'
import githubPROpen from '../../../styles/theme/images/graphics/github-pr-open.svg'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import relativeDate from '../../../utils/date/relativeDate'
import {mergeRefs} from '../../../utils/react/mergeRefs'

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
  resultRef: GitHubObjectCard_result$key
}

const GitHubObjectCard = (props: Props) => {
  const {resultRef} = props

  const result = useFragment(
    graphql`
      fragment GitHubObjectCard_result on _xGitHubSearchResultItem {
        __typename
        ... on _xGitHubIssue {
          id
          title
          number
          repository {
            nameWithOwner
            url
          }
          url
          issueState: state
          lastEvent: timelineItems(last: 1) {
            updatedAt
          }
        }
        ... on _xGitHubPullRequest {
          id
          title
          number
          repository {
            nameWithOwner
            url
          }
          url
          pullRequestState: state
          lastEvent: timelineItems(last: 1) {
            updatedAt
          }
          isDraft
        }
      }
    `,
    resultRef
  )

  const atmosphere = useAtmosphere()

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const {
    tooltipPortal: copiedTooltipPortal,
    openTooltip: openCopiedTooltip,
    closeTooltip: closeCopiedTooltip,
    originRef: copiedTooltipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)

  const trackLinkClick = () => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Card Link Clicked', {
      service: 'github'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Card Copied', {
      service: 'github'
    })
  }

  const handleCopy = () => {
    openCopiedTooltip()
    trackCopy()
    setTimeout(() => {
      closeCopiedTooltip()
    }, 2000)
  }

  if (result?.__typename !== '_xGitHubIssue' && result?.__typename !== '_xGitHubPullRequest') {
    return null
  }

  const {title, number, repository, url, lastEvent} = result
  const {nameWithOwner: repoName, url: repoUrl} = repository
  const {updatedAt} = lastEvent
  const status =
    result?.__typename === '_xGitHubIssue' ? result.issueState : result.pullRequestState
  const prIsDraft = result?.__typename === '_xGitHubPullRequest' && result.isDraft

  const modifiedStatus = prIsDraft && status === 'OPEN' ? 'DRAFT' : status
  const statusImg =
    result.__typename === '_xGitHubIssue'
      ? ISSUE_STATUS_MAP[modifiedStatus]
      : PR_STATUS_MAP[modifiedStatus]

  return (
    <div className='rounded-sm border border-solid border-slate-300 p-4 hover:border-slate-600'>
      <div className='flex gap-2 text-xs text-slate-600'>
        {statusImg && <img src={statusImg} />}
        <a
          href={url}
          target='_blank'
          className='font-medium hover:underline'
          rel='noreferrer'
          onClick={trackLinkClick}
        >
          #{number}
        </a>
        <div>Updated {relativeDate(updatedAt)}</div>
      </div>
      <div className='my-2 text-sm'>
        <a
          href={url}
          target='_blank'
          className='hover:underline'
          rel='noreferrer'
          onClick={trackLinkClick}
        >
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
            onClick={trackLinkClick}
          >
            {repoName}
          </a>
        </div>
        <CopyToClipboard text={url} onCopy={handleCopy}>
          <div
            className='h-6 rounded-full bg-transparent p-0 text-slate-500 hover:bg-slate-200'
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            ref={mergeRefs(originRef, copiedTooltipRef)}
          >
            <Link className='h-6 w-6 cursor-pointer p-0.5' />
          </div>
        </CopyToClipboard>
        {tooltipPortal('Copy link')}
        {copiedTooltipPortal('Copied!')}
      </div>
    </div>
  )
}

export default GitHubObjectCard
