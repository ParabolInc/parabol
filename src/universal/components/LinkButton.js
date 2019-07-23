import styled from '@emotion/styled'
import tinycolor from 'tinycolor2'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

const LinkButton = styled(BaseButton)((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const color = ui.palette[palette]
  const hoverColor = tinycolor.mix(color, '#000', 15).toHexString()
  const visuallyDisabled = disabled || waiting
  return {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color,
    padding: 0,
    ':hover,:focus,:active': {
      boxShadow: 'none',
      color: !visuallyDisabled && hoverColor
    }
  }
})

export default LinkButton
