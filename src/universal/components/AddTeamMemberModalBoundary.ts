import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const AddTeamMemberModalBoundary = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  height: 374,
  width: 700
})

export default AddTeamMemberModalBoundary
