import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const AddTeamMemberModalBoundary = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  maxWidth: 500,
  minWidth: 500,
  width: 500
})

export default AddTeamMemberModalBoundary
