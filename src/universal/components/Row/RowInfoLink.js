import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import styled from 'react-emotion'

const color = appTheme.palette.mid

const RowInfoLink = styled('a')({
  ...ui.rowSubheading,
  color,
  ':hover, :focus': {
    color,
    textDecoration: 'underline'
  }
})

export default RowInfoLink
