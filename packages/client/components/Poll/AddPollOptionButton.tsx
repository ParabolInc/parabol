import styled from '@emotion/styled'
import {AddOutlined} from '@mui/icons-material'
import {PollsAriaLabels} from '~/types/constEnums'
import PlainButton from '../PlainButton/PlainButton'

const StyledPlainButton = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-fg-secondary)',
  fontWeight: 600,
  fontSize: 14,
  ':hover, :focus, :active': {
    color: 'var(--color-fg-primary)'
  },
  transition: 'color 0.1s ease',
  marginRight: 'auto'
})

const AddPollOptionIcon = styled(AddOutlined)({
  width: 20,
  height: 20,
  margin: '0 4px'
})

const AddPollOptionLabel = styled('div')({
  color: 'inherit'
})

interface Props {
  onClick: () => void
  disabled?: boolean
}

export const AddPollOptionButton = (props: Props) => {
  const {onClick, disabled} = props

  return (
    <StyledPlainButton
      aria-label={PollsAriaLabels.POLL_ADD_OPTION}
      onClick={onClick}
      disabled={disabled}
    >
      <AddPollOptionIcon />
      <AddPollOptionLabel>Add another choice</AddPollOptionLabel>
    </StyledPlainButton>
  )
}
