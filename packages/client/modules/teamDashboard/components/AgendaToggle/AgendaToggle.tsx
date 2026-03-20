import styled from '@emotion/styled'
import {Chat} from '@mui/icons-material'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import ToggleTeamDrawerMutation from '~/mutations/ToggleTeamDrawerMutation'
import {PALETTE} from '../../../../styles/paletteV3'

const Label = styled('div')({
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  color: PALETTE.SLATE_700,
  textAlign: 'center'
})

const StyledIcon = styled(Chat)({
  color: PALETTE.SKY_500,
  alignSelf: 'center'
})

const IconWrapper = styled('div')({
  height: 28,
  display: 'flex',
  justifyContent: 'center'
})

const Wrapper = styled('div')({
  margin: '0 6px',
  ':hover': {
    cursor: 'pointer'
  },
  ':hover i': {
    color: PALETTE.SKY_600
  }
})

interface Props {
  teamId: string
}

const AgendaToggle = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const {teamId} = props
  const toggleHide = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(
        atmosphere,
        {teamId, teamDrawerType: 'agenda'},
        {onError, onCompleted}
      )
    }
  }
  return (
    <Wrapper onClick={toggleHide}>
      <IconWrapper>
        <StyledIcon />
      </IconWrapper>
      <Label>Agenda</Label>
    </Wrapper>
  )
}

export default AgendaToggle
