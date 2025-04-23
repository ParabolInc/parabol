import graphql from 'babel-plugin-relay/macro'
import {RefObject} from 'react'
import {useFragment} from 'react-relay'
import LinkButton from '~/components/LinkButton'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {PokerDimensionFinalScorePicker_stage$key} from '../__generated__/PokerDimensionFinalScorePicker_stage.graphql'
import AzureDevOpsFieldDimensionDropdown from './AzureDevOpsFieldDimensionDropdown'
import GitHubFieldDimensionDropdown from './GitHubFieldDimensionDropdown'
import GitLabFieldDimensionDropdown from './GitLabFieldDimensionDropdown'
import JiraFieldDimensionDropdown from './JiraFieldDimensionDropdown'
import JiraServerFieldDimensionDropdown from './JiraServerFieldDimensionDropdown'
import LinearFieldDimensionDropdown from './LinearFieldDimensionDropdown'

interface Props {
  canUpdate: boolean
  clearError: () => void
  isFacilitator: boolean
  stageRef: PokerDimensionFinalScorePicker_stage$key
  error?: string | null
  submitScore: () => void
  inputRef: RefObject<HTMLInputElement>
}

const PokerDimensionFinalScorePicker = (props: Props) => {
  const {inputRef, isFacilitator, canUpdate, error, stageRef, clearError, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment PokerDimensionFinalScorePicker_stage on EstimateStage {
        ...GitHubFieldDimensionDropdown_stage
        ...JiraFieldDimensionDropdown_stage
        ...AzureDevOpsFieldDimensionDropdown_stage
        ...GitLabFieldDimensionDropdown_stage
        ...JiraServerFieldDimensionDropdown_stage
        ...LinearFieldDimensionDropdown_stage
        task {
          integration {
            __typename
          }
        }
      }
    `,
    stageRef
  )

  const integrationType = stage.task?.integration?.__typename ?? ''

  const titleByType = {
    _xGitHubIssue: 'GitHub',
    JiraIssue: 'Jira',
    JiraServerIssue: 'Jira Data Center',
    _xGitLabIssue: 'GitLab',
    AzureDevOpsWorkItem: 'Azure DevOps',
    _xLinearIssue: 'Linear'
  } as const
  const title = titleByType[integrationType as keyof typeof titleByType]
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const focusInput = () => inputRef.current!.focus()
  return (
    <div className='flex w-full flex-wrap items-center select-none'>
      {isFacilitator ? (
        canUpdate ? (
          <LinkButton
            className='ml-2'
            onClick={submitScore}
            palette='blue'
            style={{fontSize: 12, fontWeight: 600}}
          >
            Update
          </LinkButton>
        ) : (
          <LinkButton
            className='ml-2'
            onClick={focusInput}
            palette='blue'
            style={{fontSize: 12, fontWeight: 600}}
          >
            Edit Score
          </LinkButton>
        )
      ) : null}
      <div className={`flex flex-1 justify-end ${isDesktop ? '' : 'flex-col-reverse items-end'}`}>
        {error && (
          <div
            className={`text-tomato-500 ${isDesktop ? 'pl-2 text-left text-sm font-semibold' : 'pt-2 text-right text-xs font-normal'}`}
          >
            {error}
          </div>
        )}
        <div className='flex items-center'>
          {isDesktop ? (
            <div className='flex px-2 text-sm font-semibold'>{`${title} Label: `}</div>
          ) : (
            <div className='flex pr-1 text-sm font-semibold'>Label:</div>
          )}

          {integrationType === '_xGitHubIssue' && (
            <GitHubFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}
          {integrationType === 'JiraIssue' && (
            <JiraFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}

          {integrationType === 'AzureDevOpsWorkItem' && (
            <AzureDevOpsFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}

          {integrationType === '_xGitLabIssue' && (
            <GitLabFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}

          {integrationType === 'JiraServerIssue' && (
            <JiraServerFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}

          {integrationType === '_xLinearIssue' && (
            <LinearFieldDimensionDropdown
              clearError={clearError}
              stageRef={stage}
              isFacilitator={isFacilitator}
              submitScore={submitScore}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PokerDimensionFinalScorePicker
