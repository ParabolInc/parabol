import React, {forwardRef, ReactNode} from 'react'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  className?: string
  isActive?: boolean
  label?: ReactNode
  onClick: () => void
}

const TabStyle = styled(PlainButton)<{isActive: boolean; isClickable: boolean}>(
  ({isActive, isClickable}) => ({
    alignItems: 'center',
    color: isActive ? PALETTE.PRIMARY.MAIN : PALETTE.TEXT.LIGHT,
    cursor: isClickable ? 'pointer' : 'default',
    display: 'flex',
    fontSize: '.875rem',
    justifyContent: 'center',
    outline: 0,
    lineHeight: '1.25rem',
    padding: '12px 16px',
    userSelect: 'none'
  })
)

const Label = styled('div')({
  fontWeight: 600
})

const Tab = forwardRef((props: Props, ref: any) => {
  const {className, isActive, label, onClick} = props
  return (
    <TabStyle
      className={className}
      isActive={!!isActive}
      isClickable={!isActive}
      onClick={onClick}
      innerRef={ref}
    >
      <Label>{label}</Label>
    </TabStyle>
  )
})

export default Tab
