import {Link} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import CopyToClipboard from 'react-copy-to-clipboard'
import {useFragment} from 'react-relay'
import {JiraServerObjectCard_result$key} from '../../../__generated__/JiraServerObjectCard_result.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../hooks/useCoords'
import useTooltip from '../../../hooks/useTooltip'
import jiraSVG from '../../../styles/theme/images/graphics/jira.svg'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import relativeDate from '../../../utils/date/relativeDate'
import {mergeRefs} from '../../../utils/react/mergeRefs'

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
      service: 'jira'
    })
  }

  const trackCopy = () => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Card Copied', {
      service: 'jira'
    })
  }

  const handleCopy = () => {
    openCopiedTooltip()
    trackCopy()
    setTimeout(() => {
      closeCopiedTooltip()
    }, 2000)
  }

  const {summary, url, issueKey, projectName, updatedAt} = result

  return (
    <div className='rounded-sm border border-solid border-slate-300 p-4 hover:border-slate-600'>
      <div className='flex gap-2 text-xs text-slate-600'>
        <a
          href={url}
          target='_blank'
          className='font-semibold text-slate-600 hover:underline'
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
          <div className='text-xs text-slate-600'>{projectName}</div>
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

export default JiraServerObjectCard
