import styled from '@emotion/styled'
import IconLabel from '../IconLabel'
import LinkButton from '../LinkButton'

const StyledLinkButton = styled(LinkButton)({
  color: 'var(--color-fg-secondary)',
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: 'var(--color-fg-primary)'
  }
})

interface Props {
  icon: string
  label: string
  onClick: () => void
}

const DashNavControl = (props: Props) => {
  const {icon, label, onClick} = props
  return (
    <StyledLinkButton aria-label={label} onClick={onClick}>
      <IconLabel icon={icon} iconLarge label={label} />
    </StyledLinkButton>
  )
}

export default DashNavControl
