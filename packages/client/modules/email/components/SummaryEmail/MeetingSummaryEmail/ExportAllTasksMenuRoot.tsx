import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {TaskServiceEnum} from '../../../../../__generated__/CreateTaskMutation.graphql'
import exportAllTasksMenuQuery, {
  ExportAllTasksMenuQuery
} from '../../../../../__generated__/ExportAllTasksMenuQuery.graphql'
import {ExportAllTasksMenuRoot_meeting$key} from '../../../../../__generated__/ExportAllTasksMenuRoot_meeting.graphql'
import LoadingComponent from '../../../../../components/LoadingComponent/LoadingComponent'
import {MenuProps} from '../../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../../hooks/useMutationProps'
import useQueryLoaderNow from '../../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../../types/constEnums'
import ExportAllTasksMenu from './ExportAllTasksMenu'

interface Props {
  menuProps: MenuProps
  loadingDelay: number
  loadingWidth: number
  mutationProps: MenuMutationProps
  meetingRef: ExportAllTasksMenuRoot_meeting$key
  handlePushToIntegration: (
    integrationRepoId: string,
    integrationProviderService: Exclude<TaskServiceEnum, 'PARABOL'>,
    integrationLabel?: string
  ) => void
}

const ExportAllTasksMenuRoot = (props: Props) => {
  const {
    menuProps,
    loadingDelay,
    loadingWidth,
    mutationProps,
    meetingRef,
    handlePushToIntegration
  } = props
  const meeting = useFragment(
    graphql`
      fragment ExportAllTasksMenuRoot_meeting on NewMeeting {
        teamId
        ...ExportAllTasksMenu_meeting
      }
    `,
    meetingRef
  )
  const {teamId} = meeting
  const queryRef = useQueryLoaderNow<ExportAllTasksMenuQuery>(exportAllTasksMenuQuery, {
    teamId
  })
  return (
    <Suspense
      fallback={
        <LoadingComponent
          delay={loadingDelay}
          spinnerSize={LoaderSize.MENU}
          height={loadingWidth ? LoaderSize.MENU : undefined}
          width={loadingWidth}
          showAfter={loadingWidth ? 0 : undefined}
        />
      }
    >
      {queryRef && (
        <ExportAllTasksMenu
          queryRef={queryRef}
          menuProps={menuProps}
          mutationProps={mutationProps}
          meetingRef={meeting}
          handlePushToIntegration={handlePushToIntegration}
        />
      )}
    </Suspense>
  )
}

export default ExportAllTasksMenuRoot
