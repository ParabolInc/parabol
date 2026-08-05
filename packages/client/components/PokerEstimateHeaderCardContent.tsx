import {Launch} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PokerEstimateHeaderCardContent_task$key} from '~/__generated__/PokerEstimateHeaderCardContent_task.graphql'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {cn} from '../ui/cn'
import sanitizeExternalHtml from '../utils/sanitizeExternalHtml'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import {JiraExtraFieldsContent} from './JiraExtraFieldsContent'
import {TaskJiraFieldsContent} from './TaskJiraFieldsContent'
import {TaskMoreOptionsMenu} from './TaskMoreOptionsMenu'

export type PokerEstimateHeaderCardContentProps = {
  cardTitle: string
  descriptionHTML: string
  url: string
  linkTitle: string
  linkText: string
  onRefresh?: () => void
  isRefreshing?: boolean
  taskRef: PokerEstimateHeaderCardContent_task$key
}

const PokerEstimateHeaderCardContent = (props: PokerEstimateHeaderCardContentProps) => {
  const {cardTitle, descriptionHTML, url, linkTitle, linkText, onRefresh, isRefreshing, taskRef} =
    props
  const [isExpanded, setIsExpanded] = useState(true)
  const toggleExpand = () => {
    setIsExpanded((isExpanded) => !isExpanded)
  }
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }
  const task = useFragment(
    graphql` fragment PokerEstimateHeaderCardContent_task on Task {
    ...TaskJiraFieldsContent_task
    team {
      jiraDisplayFieldIds
    }
    integration {
      __typename
      ... on JiraIssue {
        ...JiraExtraFieldsContent_issue
      }
    }
  }`,
    taskRef
  )
  const {team, integration} = task
  const {jiraDisplayFieldIds} = team
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <div className={cn('flex pb-1', isDesktop ? 'px-4' : 'px-2')}>
      <div className='mx-auto h-full w-full max-w-[1504px] rounded bg-surface-card px-4 py-3 shadow-[var(--shadow-card)]'>
        <div className='flex w-full items-start justify-between'>
          <h1 className='m-0 mb-2 text-[16px] leading-6'>{cardTitle}</h1>
          <div className='flex'>
            <CardButton>
              <IconLabel
                icon='refresh'
                onClick={isRefreshing ? undefined : handleRefresh}
                tooltip='Refresh contents'
              />
            </CardButton>
            <CardButton>
              {isExpanded ? (
                <IconLabel icon='unfold_less' onClick={toggleExpand} tooltip='Collapse contents' />
              ) : (
                <IconLabel icon='unfold_more' onClick={toggleExpand} tooltip='Expand contents' />
              )}
            </CardButton>
            {integration?.__typename === 'JiraIssue' && (
              <TaskMoreOptionsMenu
                jiraFieldsContent={
                  <TaskJiraFieldsContent
                    taskRef={task}
                    onAddJiraField={() => setIsExpanded(true)}
                  />
                }
              />
            )}
          </div>
        </div>
        <div
          className={cn(
            'm-0 font-normal text-[14px] text-fg-primary leading-5 transition-all duration-300',
            isExpanded ? 'max-h-[300px] overflow-y-auto' : 'max-h-[30px] overflow-y-hidden'
          )}
        >
          <div
            className='[&_a:focus]:text-fg-primary [&_a:hover]:text-fg-primary [&_a]:underline'
            dangerouslySetInnerHTML={{__html: sanitizeExternalHtml(descriptionHTML)}}
          />
          {integration?.__typename === 'JiraIssue' && (
            <JiraExtraFieldsContent
              jiraDisplayFieldIds={jiraDisplayFieldIds!}
              issueRef={integration}
            />
          )}
        </div>
        <a
          className='mt-[10px] flex text-[12px] text-accent leading-5 no-underline'
          href={url}
          rel='noopener noreferrer'
          target='_blank'
          title={linkTitle}
        >
          <span>{linkText}</span>
          <Launch className='ml-1 h-[18px] w-[18px]' />
        </a>
      </div>
    </div>
  )
}

export default PokerEstimateHeaderCardContent
