import styled from 'react-emotion'
import textOverflow from 'universal/styles/helpers/textOverflow'

const MenuItemLabel = styled('div')(
  ({hasIcon, disabled}: {hasIcon?: boolean; disabled?: boolean}) => ({
    ...textOverflow,
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    fontSize: 15,
    lineHeight: 2,
    padding: `0 8px`,
    paddingLeft: hasIcon && 0,
    color: disabled && 'grey'
  })
)

export default MenuItemLabel
