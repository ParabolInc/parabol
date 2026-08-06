import graphql from 'babel-plugin-relay/macro'
import {memo} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {Link} from '~/ui/icons'
import type {GitLabObjectCard_issue$key} from '../../../__generated__/GitLabObjectCard_issue.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'
import relativeDate from '../../../utils/date/relativeDate'
import {parseWebPath} from '../../../utils/parseWebPath'
import {mergeRefs} from '../../../utils/react/mergeRefs'
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
    openCopiedTooltip()
    trackCopy()
    setTimeout(() => {
      closeCopiedTooltip()
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
        <CopyToClipboard text={webUrl} onCopy={handleCopy}>
          <div
            className='h-6 w-6 cursor-pointer rounded-md bg-transparent p-0.5 text-fg-muted hover:bg-surface-hover'
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

export default GitLabObjectCard
