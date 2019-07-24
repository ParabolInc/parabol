import React, {Component} from 'react'
import {MONTHLY_PRICE} from '../utils/constants'
import plural from '../utils/plural'
import styled from '@emotion/styled'
import ui from '../styles/ui'
import tinycolor from 'tinycolor2'
import Icon from './Icon'
import {MD_ICONS_SIZE_18} from '../styles/icons'

const {green, mid} = ui.palette
const hoverColor = tinycolor.mix(mid, '#000', 15).toHexString()

interface StyleProps {
  showCost: boolean
}

const InlineEstimatedCostBlock = styled('div')<StyleProps>(({showCost}) => ({
  alignItems: 'center',
  color: showCost ? green : mid,
  cursor: showCost ? 'default' : 'pointer',
  display: 'flex',
  fontSize: '.9375rem',
  lineHeight: '2rem',
  ':hover': {
    color: !showCost && hoverColor
  }
}))

const StyledIcon = styled(Icon)<StyleProps>(({showCost}) => ({
  color: 'inherit',
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem',
  opacity: showCost ? 1 : 0.5
}))

interface Props {
  activeUserCount: number
}

class InlineEstimatedCost extends Component<Props> {
  state = {showCost: false}

  getCost = () => {
    this.setState({
      showCost: !this.state.showCost
    })
  }

  render () {
    const {activeUserCount} = this.props
    const {showCost} = this.state
    const estimatedCost = activeUserCount * MONTHLY_PRICE
    const estimate = `${activeUserCount} Active ${plural(
      activeUserCount,
      'User'
    )} x $${MONTHLY_PRICE} = $${estimatedCost}/mo`
    const question = 'How much will it cost' // sans ? to avoid underlining punctuation on hover
    const copy = showCost ? estimate : question
    return (
      <InlineEstimatedCostBlock
        onClick={!showCost ? this.getCost : undefined}
        showCost={showCost}
        title={`${question}?`}
      >
        <StyledIcon showCost={showCost}>help</StyledIcon>
        <span>{copy}</span>
        {!showCost && <span>{'?'}</span>}
      </InlineEstimatedCostBlock>
    )
  }
}

export default InlineEstimatedCost
