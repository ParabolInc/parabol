import graphql from 'babel-plugin-relay/macro'
import {memo, useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {Link} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {LinearObjectCard_issue$key} from '../../../__generated__/LinearObjectCard_issue.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {getLinearRepoName} from '../../../utils/getLinearRepoName'
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

  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const trackLinkClick = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Link Clicked', {
      service: 'linear'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Copied', {
      service: 'linear'
    })
  }

  const handleCopy = () => {
    setIsCopied(true)
    trackCopy()
    setTimeout(() => {
      setIsCopied(false)
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
    <div className='rounded-sm border border-hairline border-solid p-4 hover:border-hairline-strong'>
      <div className='flex items-center gap-2 text-fg-secondary text-xs'>
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
            <LinearSVG className='h-4 w-4 dark:[&_path]:fill-white' />
          </div>
          {repoUrl ? (
            <a
              href={repoUrl}
              target='_blank'
              className='flex items-center text-fg-secondary text-xs hover:underline'
              rel='noreferrer'
              onClick={trackLinkClick}
            >
              <span className='leading-none'>{repoStr}</span>
            </a>
          ) : (
            <span className='flex items-center text-fg-secondary text-xs leading-none'>
              {repoStr}
            </span>
          )}
        </div>
        <Tooltip open={isCopied || isHovered} onOpenChange={setIsHovered}>
          <CopyToClipboard text={url} onCopy={handleCopy}>
            <TooltipTrigger asChild>
              <div className='h-6 w-6 cursor-pointer rounded-md bg-transparent p-0.5 text-fg-muted hover:bg-surface-hover'>
                <Link className='h-full w-full' />
              </div>
            </TooltipTrigger>
          </CopyToClipboard>
          <TooltipContent side={isCopied ? 'top' : 'bottom'}>
            {isCopied ? 'Copied!' : 'Copy link'}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
})

export default LinearObjectCard
