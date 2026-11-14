import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {TaskServiceEnum} from '../../../../../__generated__/CreateTaskMutation.graphql'
import exportAllTasksMenuQuery, {
  type ExportAllTasksMenuQuery
} from '../../../../../__generated__/ExportAllTasksMenuQuery.graphql'
import type {ExportAllTasksMenuRoot_meeting$key} from '../../../../../__generated__/ExportAllTasksMenuRoot_meeting.graphql'
import LoadingComponent from '../../../../../components/LoadingComponent/LoadingComponent'
import type {MenuMutationProps} from '../../../../../hooks/useMutationProps'
import useQueryLoaderNow from '../../../../../hooks/useQueryLoaderNow'
import {LoaderSize} from '../../../../../types/constEnums'
import ExportAllTasksMenu from './ExportAllTasksMenu'

interface Props {
  mutationProps: MenuMutationProps
  meetingRef: ExportAllTasksMenuRoot_meeting$key
  handlePushToIntegration: (
    integrationRepoId: string,
    integrationProviderService: Exclude<TaskServiceEnum, 'PARABOL'>,
    integrationLabel?: string
  ) => void
}

const ExportAllTasksMenuRoot = (props: Props) => {
  const {mutationProps, meetingRef, handlePushToIntegration} = props
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
          spinnerSize={LoaderSize.MENU}
          height={LoaderSize.MENU}
          width={200}
          showAfter={0}
        />
      }
    >
      {queryRef && (
        <ExportAllTasksMenu
          queryRef={queryRef}
          mutationProps={mutationProps}
          meetingRef={meeting}
          handlePushToIntegration={handlePushToIntegration}
        />
      )}
    </Suspense>
  )
}

export default ExportAllTasksMenuRoot
