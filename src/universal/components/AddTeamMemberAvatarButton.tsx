import React, {Component, lazy} from 'react'
import styled from 'react-emotion'
import FloatingActionButton from 'universal/components/FloatingActionButton'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import LoadableModal from './LoadableModal'

interface Props extends WithAtmosphereProps {
  teamId: string
}

const AddButton = styled(FloatingActionButton)({
  fontSize: '1.5rem',
  fontWeight: 400,
  height: 32,
  marginLeft: '1rem',
  maxWidth: 32,
  padding: 0,
  width: 32
})

const AddTeamMemberModal = lazy(() =>
  import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

class AddTeamMemberAvatarButton extends Component<Props> {
  render () {
    const {teamId} = this.props
    return (
      <LoadableModal
        LoadableComponent={AddTeamMemberModal}
        queryVars={{teamId}}
        toggle={<AddButton palette='blue'>+</AddButton>}
      />
    )
  }
}

export default withAtmosphere(AddTeamMemberAvatarButton)
