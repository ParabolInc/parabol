import React, {useEffect, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import SecondaryButton from '../SecondaryButton'
import GcalModal from '../../modules/userDashboard/components/GcalModal/GcalModal'
import {CreateGcalEventInput} from '../../__generated__/StartRetrospectiveMutation.graphql'
import GcalClientManager from '../../utils/GcalClientManager'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useFragment} from 'react-relay'
import {ScheduleMeetingButton_team$key} from '~/__generated__/ScheduleMeetingButton_team.graphql'
import {ScheduleMeetingButton_viewer$key} from '~/__generated__/ScheduleMeetingButton_viewer.graphql'
import {MenuMutationProps} from '../../hooks/useMutationProps'
import useModal from '../../hooks/useModal'

type Props = {
  mutationProps: MenuMutationProps
  handleStartActivity: (gcalInput?: CreateGcalEventInput) => void
  teamRef: ScheduleMeetingButton_team$key
  viewerRef: ScheduleMeetingButton_viewer$key
}

const ScheduleMeetingButton = (props: Props) => {
  const {mutationProps, handleStartActivity, teamRef} = props
  const atmosphere = useAtmosphere()
  const [hasStartedGcalAuthTeamId, setHasStartedGcalAuthTeamId] = useState<null | string>(null)
  const {togglePortal: toggleModal, modalPortal} = useModal({
    id: 'createGcalEventModal'
  })
  const {submitting} = mutationProps

  const team = useFragment(
    graphql`
      fragment ScheduleMeetingButton_team on Team {
        id
        viewerTeamMember {
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
  const {id: teamId, viewerTeamMember} = team
  const hasStartedGcalAuth = hasStartedGcalAuthTeamId === teamId

  const viewerGcalIntegration = viewerTeamMember?.integrations.gcal
  const cloudProvider = viewerGcalIntegration?.cloudProvider

  const handleClick = () => {
    if (viewerGcalIntegration?.auth) {
      toggleModal()
    } else if (cloudProvider) {
      const {clientId, id: providerId} = cloudProvider
      GcalClientManager.openOAuth(atmosphere, providerId, clientId, teamId, mutationProps)
      setHasStartedGcalAuthTeamId(teamId)
    }
  }

  useEffect(() => {
    if (hasStartedGcalAuth && viewerGcalIntegration?.auth) {
      toggleModal()
    }
  }, [hasStartedGcalAuth, viewerGcalIntegration])

  if (!cloudProvider) return null
  return (
    <>
      <SecondaryButton onClick={handleClick} waiting={submitting} className='h-14'>
        <div className='text-lg'>Schedule</div>
      </SecondaryButton>
      {modalPortal(
        <GcalModal
          closeModal={toggleModal}
          handleStartActivityWithGcalEvent={handleStartActivity}
          teamRef={team}
        />
      )}
    </>
  )
}

export default ScheduleMeetingButton
