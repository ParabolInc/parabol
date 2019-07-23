import styled from '@emotion/styled'
import tinycolor from 'tinycolor2'
import ui from 'universal/styles/ui'
import BaseButton, {BaseButtonProps} from 'universal/components/BaseButton'

interface Props extends BaseButtonProps {
  palette: string
}

const LinkButton = styled(BaseButton)<Props>((props) => {
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
      color: !visuallyDisabled ? hoverColor : undefined
    }
  }
})

export default LinkButton
