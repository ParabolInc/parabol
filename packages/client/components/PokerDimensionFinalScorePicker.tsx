import graphql from 'babel-plugin-relay/macro'
import type {RefObject} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {Button} from '~/ui/Button/Button'
import type {PokerDimensionFinalScorePicker_stage$key} from '../__generated__/PokerDimensionFinalScorePicker_stage.graphql'
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
    <div className='flex w-full select-none flex-wrap items-center'>
      {isFacilitator ? (
        canUpdate ? (
          <Button
            size='default'
            className='ml-2 bg-transparent p-0 text-[14px] text-sky-500 leading-5 shadow-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
            onClick={submitScore}
            style={{fontSize: 12, fontWeight: 600}}
          >
            Update
          </Button>
        ) : (
          <Button
            size='default'
            className='ml-2 bg-transparent p-0 text-[14px] text-sky-500 leading-5 shadow-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
            onClick={focusInput}
            style={{fontSize: 12, fontWeight: 600}}
          >
            Edit Score
          </Button>
        )
      ) : null}
      <div className={`flex flex-1 justify-end ${isDesktop ? '' : 'flex-col-reverse items-end'}`}>
        {error && (
          <div
            className={`text-fg-error ${isDesktop ? 'pl-2 text-left font-semibold text-sm' : 'pt-2 text-right font-normal text-xs'}`}
          >
            {error}
          </div>
        )}
        <div className='flex items-center'>
          {isDesktop ? (
            <div className='flex px-2 font-semibold text-sm'>{`${title} Label: `}</div>
          ) : (
            <div className='flex pr-1 font-semibold text-sm'>Label:</div>
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
