import {Launch} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {PokerEstimateHeaderCardIntegration_stage$key} from '~/__generated__/PokerEstimateHeaderCardIntegration_stage.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import CardButton from './CardButton'
import IconLabel from './IconLabel'
import {JiraExtraFieldsContent} from './JiraExtraFieldsContent'
import PokerEstimateHeaderCardEditable from './PokerEstimateHeaderCardEditable'
import PokerEstimateHeaderCardReadonly from './PokerEstimateHeaderCardReadonly'
import {TaskJiraFieldsContent} from './TaskJiraFieldsContent'
import {TaskMoreOptionsMenu} from './TaskMoreOptionsMenu'

export interface HeaderFields {
  cardTitle: string
  descriptionHTML: string
  url: string
  linkTitle: string
  linkText: string
}

interface Props {
  stageRef: PokerEstimateHeaderCardIntegration_stage$key
  headerFields: HeaderFields
  editorContent: string | null
  onRefresh?: () => void
  isRefreshing?: boolean
}

const PokerEstimateHeaderCardIntegration = (props: Props) => {
  const {stageRef, headerFields, editorContent, onRefresh, isRefreshing} = props
  const [isExpanded, setIsExpanded] = useState(true)

  const stage = useFragment(
    graphql`
      fragment PokerEstimateHeaderCardIntegration_stage on EstimateStage {
        task {
          id
          teamId
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
        }
      }
    `,
    stageRef
  )

  const {task} = stage
  const {id: taskId, teamId, team, integration} = task!
  const {jiraDisplayFieldIds} = team
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const isJira = integration?.__typename === 'JiraIssue'
  const toggleExpand = () => setIsExpanded((v) => !v)

  return (
    <div className={`flex ${isDesktop ? 'px-4 pb-1' : 'px-2 pb-1'}`}>
      <div
        className='mx-auto w-full rounded bg-white p-3 px-4 shadow-md'
        style={{maxWidth: '1504px'}}
      >
        <div className='mb-2 flex w-full items-start justify-between'>
          <h1 className='m-0 font-semibold text-base leading-6'>{headerFields.cardTitle}</h1>
          <div className='flex'>
            <CardButton>
              <IconLabel
                icon='refresh'
                onClick={isRefreshing ? undefined : onRefresh}
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
            {isJira && (
              <TaskMoreOptionsMenu
                jiraFieldsContent={
                  <TaskJiraFieldsContent
                    taskRef={task!}
                    onAddJiraField={() => setIsExpanded(true)}
                  />
                }
              />
            )}
          </div>
        </div>
        <div
          className={`font-normal text-slate-700 text-sm leading-5 transition-all duration-300 ${
            isExpanded ? 'overflow-y-auto' : 'overflow-y-hidden'
          }`}
          style={{maxHeight: isExpanded ? 300 : 30}}
        >
          {editorContent !== null ? (
            <PokerEstimateHeaderCardEditable
              taskId={taskId}
              teamId={teamId}
              content={editorContent}
              hideTitle
            />
          ) : (
            <PokerEstimateHeaderCardReadonly descriptionHTML={headerFields.descriptionHTML} />
          )}
          {isJira && integration?.__typename === 'JiraIssue' && (
            <JiraExtraFieldsContent
              jiraDisplayFieldIds={jiraDisplayFieldIds!}
              issueRef={integration}
            />
          )}
        </div>
        <a
          href={headerFields.url}
          rel='noopener noreferrer'
          target='_blank'
          title={headerFields.linkTitle}
          className='mt-2.5 flex items-center text-sky-500 text-xs leading-5 no-underline'
        >
          <span className='text-xs'>{headerFields.linkText}</span>
          <Launch sx={{height: 18, width: 18, marginLeft: '4px'}} />
        </a>
      </div>
    </div>
  )
}

export default PokerEstimateHeaderCardIntegration
