import {Link} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {memo} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {LinearObjectCard_issue$key} from '../../../__generated__/LinearObjectCard_issue.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'
import {getLinearRepoName} from '../../../utils/getLinearRepoName'
import {mergeRefs} from '../../../utils/react/mergeRefs'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import LinearSVG from '../../LinearSVG'

interface Props {
  issueRef: LinearObjectCard_issue$key
}

const LinearObjectCard = memo((props: Props) => {
  const {issueRef} = props

  const issue = useFragment(
    graphql`
      fragment LinearObjectCard_issue on _xLinearIssue {
        id
        title
        identifier
        url
        state {
          name
        }
        project {
          name
          url
        }
        team {
          displayName
        }
      }
    `,
    issueRef
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
      service: 'linear'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Card Copied', {
      service: 'linear'
    })
  }

  const handleCopy = () => {
    openCopiedTooltip()
    trackCopy()
    setTimeout(() => {
      closeCopiedTooltip()
    }, 2000)
  }

  if (!issue) {
    return null
  }

  const {
    title,
    identifier,
    url,
    state,
    project,
    team: {displayName: teamName}
  } = issue
  const repoStr = getLinearRepoName(project, teamName)
  const repoUrl = project?.url

  return (
    <div className='rounded-sm border border-solid border-slate-300 p-4 hover:border-slate-600'>
      <div className='flex items-center gap-2 text-xs text-slate-600'>
        <span className='font-medium'>{identifier}</span>
        <span>•</span>
        <span>{state.name}</span>
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
          <div className='flex h-4 w-4 items-center justify-center'>
            <LinearSVG />
          </div>
          {repoUrl ? (
            <a
              href={repoUrl}
              target='_blank'
              className='flex items-center text-xs text-slate-600 hover:underline'
              rel='noreferrer'
              onClick={trackLinkClick}
            >
              <span className='leading-none'>{repoStr}</span>
            </a>
          ) : (
            <span className='flex items-center text-xs leading-none text-slate-600'>{repoStr}</span>
          )}
        </div>
        <CopyToClipboard text={url} onCopy={handleCopy}>
          <div
            className='h-6 w-6 cursor-pointer rounded-full bg-transparent p-0.5 text-slate-500 hover:bg-slate-200'
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            ref={mergeRefs(originRef, copiedTooltipRef)}
          >
            <Link className='h-full w-full' />
          </div>
        </CopyToClipboard>
        {tooltipPortal('Copy link')}
        {copiedTooltipPortal('Copied!')}
      </div>
    </div>
  )
})

export default LinearObjectCard
