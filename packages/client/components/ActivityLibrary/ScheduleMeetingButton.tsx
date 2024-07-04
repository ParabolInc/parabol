import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScheduleMeetingButton_team$key} from '~/__generated__/ScheduleMeetingButton_team.graphql'
import {
  CreateGcalEventInput,
  RecurrenceSettingsInput
} from '../../__generated__/StartRetrospectiveMutation.graphql'
import useModal from '../../hooks/useModal'
import {MenuMutationProps} from '../../hooks/useMutationProps'
import DialogContainer from '../DialogContainer'
import {ScheduleDialog} from '../ScheduleDialog'
import SecondaryButton from '../SecondaryButton'

type Props = {
  mutationProps: MenuMutationProps
  handleStartActivity: (
    gcalInput?: CreateGcalEventInput,
    recurrenceInput?: RecurrenceSettingsInput
  ) => void
  teamRef: ScheduleMeetingButton_team$key
  placeholder: string
  withRecurrence?: boolean
}

const ScheduleMeetingButton = (props: Props) => {
  const {mutationProps, handleStartActivity, teamRef, placeholder, withRecurrence} = props
  const {
    togglePortal: toggleModal,
    closePortal: closeModal,
    modalPortal
  } = useModal({
    id: 'createGcalEventModal'
  })
  const {submitting} = mutationProps

  const team = useFragment(
    graphql`
      fragment ScheduleMeetingButton_team on Team {
        id
        viewerTeamMember {
          integrations {
            gcal {
              cloudProvider {
                id
              }
            }
          }
        }
        ...ScheduleDialog_team
      }
    `,
    teamRef
  )
  const {viewerTeamMember} = team

  const viewerGcalIntegration = viewerTeamMember?.integrations.gcal
  const cloudProvider = viewerGcalIntegration?.cloudProvider

  const handleClick = () => {
    toggleModal()
  }
  const onStartActivity = (
    gcalInput?: CreateGcalEventInput,
    recurrenceInput?: RecurrenceSettingsInput
  ) => {
    handleStartActivity(gcalInput, recurrenceInput)
    closeModal()
  }

  if (!cloudProvider && !withRecurrence) return null
  return (
    <>
      <SecondaryButton onClick={handleClick} waiting={submitting} className='h-14'>
        <div className='text-lg'>Schedule</div>
      </SecondaryButton>
      {modalPortal(
        <DialogContainer className='bg-white'>
          <ScheduleDialog
            teamRef={team}
            placeholder={placeholder}
            onStartActivity={onStartActivity}
            onCancel={closeModal}
            mutationProps={mutationProps}
            withRecurrence={withRecurrence}
          />
        </DialogContainer>
      )}
    </>
  )
}

export default ScheduleMeetingButton
