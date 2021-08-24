import React from 'react'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ToggleManageTeamMutation from '../../../../mutations/ToggleManageTeamMutation'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import {CompletedHandler, ErrorHandler} from '../../../../types/relayMutations'
import IconButton from '../../../../components/IconButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'

interface Props {
  hideManageTeam?: boolean
  teamId: string
}

const CloseManageTeam = (props: Props) => {
  const {hideManageTeam, teamId} = props
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()

  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleManageTeamMutation(atmosphere, {teamId}, {onError, onCompleted})
    }
  }
  return (
    <IconButton
      key={`manageTeam${hideManageTeam ? 'Show' : 'Hide'}`}
      icon={'close'}
      iconLarge
      onClick={toggleHide}
      palette='midGray'
    />
  )
}

export default CloseManageTeam
