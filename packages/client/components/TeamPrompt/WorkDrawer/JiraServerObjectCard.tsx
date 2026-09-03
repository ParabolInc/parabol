import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {Link} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {JiraServerObjectCard_result$key} from '../../../__generated__/JiraServerObjectCard_result.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import jiraSVG from '../../../styles/theme/images/graphics/jira.svg'
import relativeDate from '../../../utils/date/relativeDate'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'

interface Props {
  resultRef: JiraServerObjectCard_result$key
}

const JiraServerObjectCard = (props: Props) => {
  const {resultRef} = props

  const result = useFragment(
    graphql`
      fragment JiraServerObjectCard_result on JiraServerIssue {
        id
        summary
        url
        issueKey
        projectKey
        projectName
        updatedAt
      }
    `,
    resultRef
  )

  const atmosphere = useAtmosphere()

  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const trackLinkClick = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Link Clicked', {
      service: 'jira'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Card Copied', {
      service: 'jira'
    })
  }

  const handleCopy = () => {
    setIsCopied(true)
    trackCopy()
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const {summary, url, issueKey, projectName, updatedAt} = result

  return (
    <div className='rounded-sm border border-hairline border-solid p-4 hover:border-hairline-strong'>
      <div className='flex gap-2 text-fg-secondary text-xs'>
        <a
          href={url}
          target='_blank'
          className='font-semibold text-fg-secondary hover:underline'
          rel='noreferrer'
          onClick={trackLinkClick}
        >
          {issueKey}
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
          {summary}
        </a>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='h-4 w-4'>
            <img src={jiraSVG} />
          </div>
          <div className='text-fg-secondary text-xs'>{projectName}</div>
        </div>
        <Tooltip open={isCopied || isHovered} onOpenChange={setIsHovered}>
          <CopyToClipboard text={url} onCopy={handleCopy}>
            <TooltipTrigger asChild>
              <div className='h-6 rounded-md bg-transparent p-0 text-fg-muted hover:bg-surface-hover'>
                <Link className='h-6 w-6 cursor-pointer p-0.5' />
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
}

export default JiraServerObjectCard
