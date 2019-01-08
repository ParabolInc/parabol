import React, {Component, lazy} from 'react'
import styled from 'react-emotion'
import OutlinedButton from 'universal/components/OutlinedButton'
import ui from 'universal/styles/ui'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import LoadableModal from './LoadableModal'
import Icon from 'universal/components/Icon'

interface Props extends WithAtmosphereProps {
  isMeeting?: boolean
  team: any
  teamMembers: ReadonlyArray<any>
}

const AddButton = styled(OutlinedButton)(
  {
    fontSize: '1.5rem',
    fontWeight: 400,
    height: 32,
    marginLeft: '1rem',
    padding: 0,
    width: 32
  },
  ({isMeeting}: {isMeeting: boolean}) =>
    isMeeting && {
      height: 36,
      width: 36,
      maxWidth: 36,
      [ui.breakpoint.wide]: {
        height: 40,
        width: 40,
        maxWidth: 40
      },
      [ui.breakpoint.wider]: {
        height: 48,
        width: 48,
        maxWidth: 48
      },
      [ui.breakpoint.widest]: {
        height: 64,
        width: 64,
        maxWidth: 64
      }
    }
)

const AddTeamMemberModal = lazy(() =>
  import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

class AddTeamMemberAvatarButton extends Component<Props> {
  render () {
    const {isMeeting, team, teamMembers} = this.props
    return (
      <LoadableModal
        LoadableComponent={AddTeamMemberModal}
        queryVars={{team, teamMembers}}
        toggle={
          <AddButton isMeeting={isMeeting} palette='blue'>
            <Icon>add</Icon>
          </AddButton>
        }
      />
    )
  }
}

export default withAtmosphere(AddTeamMemberAvatarButton)
