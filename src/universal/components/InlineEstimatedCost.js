import React, {Component} from 'react'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {MONTHLY_PRICE} from 'universal/utils/constants'
import plural from 'universal/utils/plural'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import tinycolor from 'tinycolor2'

const {green, mid} = ui.palette
const hoverColor = tinycolor.mix(mid, '#000', 15).toHexString()

const InlineEstimatedCostBlock = styled('div')(({showCost}) => ({
  color: showCost ? green : mid,
  cursor: showCost ? 'default' : 'pointer',
  fontSize: '.9375rem',
  lineHeight: '2rem',
  ':hover': {
    color: !showCost && hoverColor
  }
}))

const StyledIcon = styled(StyledFontAwesome)(({showCost}) => ({
  color: 'inherit',
  fontSize: ui.iconSize,
  marginRight: '.5rem',
  opacity: showCost ? 1 : 0.5,
  width: '1.125rem'
}))

type Props = {|
  activeUserCount: Number
|}

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
        onClick={!showCost ? this.getCost : null}
        showCost={showCost}
        title={`${question}?`}
      >
        <StyledIcon name='question-circle' showCost={showCost} />
        <span>{copy}</span>
        {!showCost && <span>{'?'}</span>}
      </InlineEstimatedCostBlock>
    )
  }
}

export default InlineEstimatedCost
