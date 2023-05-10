import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {Check} from '@mui/icons-material'
import {MenuPosition} from '../../../../../hooks/useCoords'
import useMenu from '../../../../../hooks/useMenu'
import useMutationProps, {getOnCompletedError} from '../../../../../hooks/useMutationProps'
import lazyPreload from '../../../../../utils/lazyPreload'
import {useFragment} from 'react-relay'
import {
  ExportAllTasks_meeting$key,
  TaskServiceEnum
} from '../../../../../__generated__/ExportAllTasks_meeting.graphql'
import styled from '@emotion/styled'
import BaseButton from '../../../../../components/BaseButton'
import {PALETTE} from '../../../../../styles/paletteV3'
import {buttonShadow} from '../../../../../styles/elevation'
import {emailFontFamily} from '../../../styles'
import {IntegrationProviderServiceEnum} from '../../../../../__generated__/TaskFooterIntegrateMenuListLocalQuery.graphql'
import CreateTaskIntegrationMutation from '../../../../../mutations/CreateTaskIntegrationMutation'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import {integrationSvgLookup} from '../../../../../components/TaskIntegrationMenuItem'
import {Providers} from '../../../../../types/constEnums'

const ExportAllTasksMenuRoot = lazyPreload(
  () => import(/* webpackChunkName: 'ExportAllTasksMenuRoot' */ './ExportAllTasksMenuRoot')
)

const integrationToServiceName: Record<TaskServiceEnum, string> = {
  PARABOL: 'Parabol',
  github: Providers.GITHUB_NAME,
  jira: 'Jira',
  jiraServer: Providers.JIRA_SERVER_NAME,
  azureDevOps: Providers.AZUREDEVOPS_NAME,
  gitlab: Providers.GITHUB_NAME
}

interface Props {
  meetingRef: ExportAllTasks_meeting$key
}

const ExportButton = styled(BaseButton)({
  backgroundColor: PALETTE.SKY_500,
  opacity: 1,
  outline: 0,
  marginTop: 12,
  padding: '9px 20px',
  borderRadius: '4em',
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'block',
  fontFamily: emailFontFamily,
  fontSize: 14,
  fontWeight: 600,
  margin: '0px auto',
  textAlign: 'center',
  textDecoration: 'none'
})

const ExportAllTasks = (props: Props) => {
  const {meetingRef} = props
  const mutationProps = useMutationProps()
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = mutationProps
  const {togglePortal, originRef, menuPortal, menuProps, loadingWidth, loadingDelay} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {
      loadingWidth: 200
    }
  )
  const meeting = useFragment(
    graphql`
      fragment ExportAllTasks_meeting on NewMeeting {
        teamId
        ...ExportAllTasksMenuRoot_meeting
        ... on RetrospectiveMeeting {
          tasks {
            id
            taskService
            integration {
              id
            }
          }
        }
        ... on ActionMeeting {
          tasks {
            id
            taskService
            integration {
              id
            }
          }
        }
      }
    `,
    meetingRef
  )

  const [pushedIntegrationLabel, setPushedIntegrationLabel] = useState<string | null>(null)

  const {tasks} = meeting
  if (!tasks) {
    return null
  }

  const filteredTasks = tasks.filter((task) => !task.integration)
  const taskServices = Array.from(
    tasks.reduce(
      (serviceSet, task) => (task.taskService ? serviceSet.add(task.taskService) : serviceSet),
      new Set<string>()
    )
  )

  const handlePushToIntegration = (
    integrationRepoId: string,
    integrationProviderService: IntegrationProviderServiceEnum,
    integrationLabel?: string
  ) => {
    submitMutation()
    Promise.allSettled(
      filteredTasks?.map((task) => {
        return new Promise<void>((resolve, reject) => {
          const variables = {
            integrationRepoId,
            taskId: task.id,
            integrationProviderService: integrationProviderService
          }
          CreateTaskIntegrationMutation(atmosphere, variables, {
            onError: reject,
            onCompleted: (res, errors) => {
              const error = getOnCompletedError(res, errors)
              if (error) {
                reject(error)
              } else {
                resolve()
              }
            }
          })
        })
      })
    ).then((results) => {
      const errors = results.filter((res) => res.status === 'rejected') as PromiseRejectedResult[]
      if (errors.length > 0) {
        onError(errors[0]!.reason)
      } else {
        integrationLabel && setPushedIntegrationLabel(integrationLabel)
        onCompleted()
      }
    })
  }

  return (
    <>
      {submitting ? (
        <span className='flex justify-center text-center'>Pushing tasks to integration...</span>
      ) : filteredTasks.length === 0 ? (
        <span className='flex justify-center text-center'>
          {taskServices.length === 1 ? (
            <>
              <span>
                All tasks pushed to{' '}
                <b>
                  {pushedIntegrationLabel ??
                    integrationToServiceName[taskServices[0] as TaskServiceEnum]}
                </b>
              </span>
              {integrationSvgLookup[taskServices[0] as TaskServiceEnum]}
            </>
          ) : (
            <>
              All tasks pushed to integrations
              <Check className='ml-2' />
            </>
          )}
        </span>
      ) : (
        <ExportButton
          onClick={togglePortal}
          ref={originRef}
          onMouseEnter={ExportAllTasksMenuRoot.preload}
        >
          Export tasks to integration
        </ExportButton>
      )}
      {menuPortal(
        <ExportAllTasksMenuRoot
          menuProps={menuProps}
          loadingDelay={loadingDelay}
          loadingWidth={loadingWidth}
          mutationProps={mutationProps}
          meetingRef={meeting}
          handlePushToIntegration={handlePushToIntegration}
        />
      )}
    </>
  )
}

export default ExportAllTasks
