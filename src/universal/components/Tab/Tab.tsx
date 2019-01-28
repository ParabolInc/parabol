import React, {Component} from 'react'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  isActive?: boolean
  label?: string
  onClick: () => void
}

const TabStyle = styled(PlainButton)<{isActive: boolean; isClickable: boolean}>(
  ({isActive, isClickable}) => ({
    alignItems: 'center',
    color: isActive ? PALETTE.PRIMARY.MAIN : PALETTE.TEXT.LIGHT,
    cursor: isClickable ? 'pointer' : 'default',
    display: 'flex',
    fontSize: 18,
    outline: 0,
    padding: '1rem 1.5rem',
    userSelect: 'none'
  })
)

const Label = styled('div')({
  fontWeight: 600
})

class Tab extends Component<Props> {
  ref = React.createRef<HTMLButtonElement>()
  getBoundingRect = () => {
    const el = this.ref.current
    if (!el) return null
    return el.getBoundingClientRect()
  }

  render () {
    const {isActive, label, onClick} = this.props
    return (
      <TabStyle isActive={!!isActive} isClickable={!isActive} onClick={onClick} innerRef={this.ref}>
        <Label>{label}</Label>
      </TabStyle>
    )
  }
}

export default Tab
