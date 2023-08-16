import React, {useEffect, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useDialogState} from '../../ui/Dialog/useDialogState'
import SecondaryButton from '../SecondaryButton'
import GcalModal from '../../modules/userDashboard/components/GcalModal/GcalModal'
import {CreateGcalEventInput} from '../../__generated__/StartRetrospectiveMutation.graphql'
import GcalClientManager from '../../utils/GcalClientManager'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useFragment} from 'react-relay'
import {ScheduleMeetingButton_team$key} from '~/__generated__/ScheduleMeetingButton_team.graphql'
import {ScheduleMeetingButton_viewer$key} from '~/__generated__/ScheduleMeetingButton_viewer.graphql'
import {MenuMutationProps} from '../../hooks/useMutationProps'

type Props = {
  mutationProps: MenuMutationProps
  handleStartActivity: (gcalInput?: CreateGcalEventInput) => void
  teamRef: ScheduleMeetingButton_team$key
  viewerRef: ScheduleMeetingButton_viewer$key
}

const ScheduleMeetingButton = (props: Props) => {
  const {mutationProps, handleStartActivity, teamRef, viewerRef} = props
  const {
    isOpen: isScheduleDialogOpen,
    open: openScheduleDialog,
    close: closeScheduleDialog
  } = useDialogState()
  const atmosphere = useAtmosphere()
  const [hasStartedGcalAuth, setHasStartedGcalAuth] = useState(false)
  const {submitting} = mutationProps

  const viewer = useFragment(
    graphql`
      fragment ScheduleMeetingButton_viewer on User {
        featureFlags {
          gcal
        }
      }
    `,
    viewerRef
  )
  const hasGcalFlag = viewer.featureFlags.gcal

  const team = useFragment(
    graphql`
      fragment ScheduleMeetingButton_team on Team {
        id
        teamMembers {
          isSelf
          integrations {
            gcal {
              auth {
                id
              }
              cloudProvider {
                id
                clientId
              }
            }
          }
        }
        ...GcalModal_team
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers} = team
  const viewerGcalIntegration = teamMembers.find((teamMember) => teamMember.isSelf)?.integrations
    .gcal

  const handleClick = () => {
    if (viewerGcalIntegration?.auth) {
      openScheduleDialog()
    } else if (viewerGcalIntegration?.cloudProvider) {
      const {cloudProvider} = viewerGcalIntegration
      const {clientId, id: providerId} = cloudProvider
      GcalClientManager.openOAuth(atmosphere, providerId, clientId, teamId, mutationProps)
      setHasStartedGcalAuth(true)
    }
  }

  useEffect(() => {
    if (hasStartedGcalAuth && viewerGcalIntegration?.auth) {
      openScheduleDialog()
    }
  }, [hasStartedGcalAuth, viewerGcalIntegration])

  if (!hasGcalFlag) return null
  return (
    <>
      <SecondaryButton onClick={handleClick} waiting={submitting} className='h-14'>
        <div className='text-lg'>Schedule</div>
      </SecondaryButton>
      <GcalModal
        closeModal={closeScheduleDialog}
        isOpen={isScheduleDialogOpen}
        handleStartActivityWithGcalEvent={handleStartActivity}
        teamRef={team}
      />
    </>
  )
}

export default ScheduleMeetingButton
