import styled from 'react-emotion'
import textOverflow from 'universal/styles/helpers/textOverflow'

const MenuItemLabel = styled('div')(
  ({hasIcon, disabled}: {hasIcon?: boolean; disabled?: boolean}) => ({
    ...textOverflow,
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    fontSize: 14,
    lineHeight: '24px',
    padding: `4px 8px 4px 16px`,
    paddingLeft: hasIcon && 0,
    color: disabled && 'grey'
  })
)

export default MenuItemLabel
