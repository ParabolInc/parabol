import styled from '@emotion/styled'
import {Business, Group, Public} from '@mui/icons-material'

const Label = styled('span')({
  alignItems: 'center',
  color: 'var(--color-fg-primary)',
  display: 'flex',
  fontSize: 15,
  lineHeight: '32px',
  padding: `0 12px`,
  width: '100%'
})

const StyledIcon = styled('div')({
  color: 'var(--color-fg-secondary)',
  height: 24,
  width: 24,
  marginRight: 12
})

interface Props {
  //FIXME 6062: change to React.ComponentType
  icon: string
  label: string
}

const DropdownMenuIconItemLabel = (props: Props) => {
  const {icon, label} = props
  return (
    <Label>
      <StyledIcon>
        {
          {
            group: <Group />,
            business: <Business />,
            public: <Public />
          }[icon]
        }
      </StyledIcon>
      {label}
    </Label>
  )
}
export default DropdownMenuIconItemLabel
