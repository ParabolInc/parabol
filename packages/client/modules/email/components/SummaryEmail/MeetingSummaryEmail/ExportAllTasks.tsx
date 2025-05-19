import {Loop} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {
  ExportAllTasks_meeting$key,
  TaskServiceEnum
} from '../../../../../__generated__/ExportAllTasks_meeting.graphql'
import GitHubSVG from '../../../../../components/GitHubSVG'
import GitLabSVG from '../../../../../components/GitLabSVG'
import JiraSVG from '../../../../../components/JiraSVG'
import {integrationSvgLookup} from '../../../../../components/TaskIntegrationMenuItem'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../../hooks/useCoords'
import useMenu from '../../../../../hooks/useMenu'
import useMutationProps, {getOnCompletedError} from '../../../../../hooks/useMutationProps'
import CreateTaskIntegrationMutation from '../../../../../mutations/CreateTaskIntegrationMutation'
import {Providers} from '../../../../../types/constEnums'
import SendClientSideEvent from '../../../../../utils/SendClientSideEvent'
import lazyPreload from '../../../../../utils/lazyPreload'

const ExportAllTasksMenuRoot = lazyPreload(
  () => import(/* webpackChunkName: 'ExportAllTasksMenuRoot' */ './ExportAllTasksMenuRoot')
)

const BUTTON_CLASSES =
  'flex items-center gap-2 rounded-full border border-solid border-slate-400 px-5 py-2 text-center font-sans text-sm font-semibold'

const integrationToServiceName: Record<TaskServiceEnum, string> = {
  PARABOL: 'Parabol',
  github: Providers.GITHUB_NAME,
  jira: 'Jira',
  jiraServer: Providers.JIRA_SERVER_NAME,
  azureDevOps: Providers.AZUREDEVOPS_NAME,
  gitlab: Providers.GITHUB_NAME,
  linear: Providers.LINEAR_NAME
}

interface Props {
  meetingRef: ExportAllTasks_meeting$key
}

graphql`
  fragment ExportAllTasks_meetingTasks on Task {
    id
    taskService
    integration {
      id
    }
  }
`

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
        id
        meetingType
        teamId
        ...ExportAllTasksMenuRoot_meeting
        ... on RetrospectiveMeeting {
          tasks {
            ...ExportAllTasks_meetingTasks @relay(mask: false)
          }
        }
        ... on ActionMeeting {
          tasks {
            ...ExportAllTasks_meetingTasks @relay(mask: false)
          }
        }
        ... on TeamPromptMeeting {
          tasks {
            ...ExportAllTasks_meetingTasks @relay(mask: false)
          }
        }
      }
    `,
    meetingRef
  )

  // :TODO: (jmtaber129): Get this information from the tasks integration.
  const [pushedIntegrationLabel, setPushedIntegrationLabel] = useState<string | null>(null)

  const {id: meetingId, meetingType, tasks, teamId} = meeting
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

  const handlePushToIntegration = async (
    integrationRepoId: string,
    integrationProviderService: Exclude<TaskServiceEnum, 'PARABOL'>,
    integrationLabel?: string
  ) => {
    submitMutation()
    const results = await Promise.allSettled(
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
    )

    const errors = results.filter((res) => res.status === 'rejected') as PromiseRejectedResult[]
    if (errors.length > 0) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'bulkExportError',
        message: 'Could not sync all tasks. Please try again',
        autoDismiss: 10
      })
      onError(errors[0]!.reason)
    } else {
      SendClientSideEvent(atmosphere, 'Bulk Tasks Published', {
        teamId,
        meetingId,
        meetingType,
        service: integrationProviderService
      })
      integrationLabel && setPushedIntegrationLabel(integrationLabel)
      onCompleted()
    }
  }

  return (
    <>
      {submitting ? (
        <button className={clsx(BUTTON_CLASSES, 'cursor-wait bg-slate-300')}>
          <Loop style={{width: '14px', height: '14px'}} /> Syncing in Progress...
        </button>
      ) : filteredTasks.length === 0 ? (
        <button className={clsx(BUTTON_CLASSES, 'bg-slate-200')}>
          {taskServices.length === 1 ? (
            <>
              {integrationSvgLookup[taskServices[0] as TaskServiceEnum]}
              Tasks synced to{' '}
              {pushedIntegrationLabel ??
                integrationToServiceName[taskServices[0] as TaskServiceEnum]}
            </>
          ) : (
            'Tasks synced'
          )}
        </button>
      ) : (
        <button
          className={clsx(BUTTON_CLASSES, 'cursor-pointer bg-white hover:bg-slate-100')}
          onClick={togglePortal}
          ref={originRef}
          onMouseEnter={ExportAllTasksMenuRoot.preload}
        >
          <div>Send Tasks to</div>
          <JiraSVG /> <GitHubSVG /> <GitLabSVG />
        </button>
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
