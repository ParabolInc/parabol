import graphql from 'babel-plugin-relay/macro'
import {memo, useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {Link} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {GitLabObjectCard_issue$key} from '../../../__generated__/GitLabObjectCard_issue.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import relativeDate from '../../../utils/date/relativeDate'
import {parseWebPath} from '../../../utils/parseWebPath'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import GitLabSVG from '../../GitLabSVG'

interface Props {
  issueRef: GitLabObjectCard_issue$key
}

const GitLabObjectCard = memo((props: Props) => {
  const {issueRef} = props

  const issue = useFragment(
    graphql`
      fragment GitLabObjectCard_issue on _xGitLabIssue {
        id
        iid
        title
        webUrl
        webPath
        updatedAt
      }
    `,
    issueRef
  )

  const atmosphere = useAtmosphere()

  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const trackLinkClick = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Link Clicked', {
      service: 'gitlab'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Copied', {
      service: 'gitlab'
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

  const {iid, title, webUrl, webPath, updatedAt} = issue
  const {fullPath} = parseWebPath(webPath)
  const projectUrl = webUrl.split('/-/')[0]

  return (
    <div className='rounded-sm border border-hairline border-solid p-4 hover:border-hairline-strong'>
      <div className='flex gap-2 text-fg-secondary text-xs'>
        <a
          href={webUrl}
          target='_blank'
          className='font-medium hover:underline'
          rel='noreferrer'
          onClick={trackLinkClick}
        >
          #{iid}
        </a>
        <div>Updated {relativeDate(updatedAt)}</div>
      </div>
      <div className='my-2 text-sm'>
        <a
          href={webUrl}
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
            <GitLabSVG className='h-4 w-4' />
          </div>
          <a
            href={projectUrl}
            target='_blank'
            className='text-fg-secondary text-xs hover:underline'
            rel='noreferrer'
            onClick={trackLinkClick}
          >
            {fullPath}
          </a>
        </div>
        <Tooltip open={isCopied || isHovered} onOpenChange={setIsHovered}>
          <CopyToClipboard text={webUrl} onCopy={handleCopy}>
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

export default GitLabObjectCard
