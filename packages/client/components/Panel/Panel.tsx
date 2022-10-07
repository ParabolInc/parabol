import styled from '@emotion/styled'
import React, {CSSProperties, ReactNode} from 'react'
import {panelShadow} from '../../styles/elevation'
import {Layout} from '../../types/constEnums'
import LabelHeading from '../LabelHeading/LabelHeading'

const PanelRoot = styled('div')({
  backgroundColor: 'white',
  boxShadow: panelShadow,
  borderRadius: 4,
  fontSize: 14,
  lineHeight: '20px',
  margin: '16px 0',
  position: 'relative',
  width: '100%'
})

const PanelHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const PanelLabel = styled(LabelHeading)<{casing: CSSProperties['textTransform']}>(({casing}) => ({
  padding: `8px ${Layout.ROW_GUTTER}px`,
  textTransform: casing ? casing : 'uppercase'
}))

const PanelControls = styled('div')({
  display: 'flex',
  flex: 1,
  height: 44,
  justifyContent: 'flex-end',
  lineHeight: '44px',
  padding: `0 ${Layout.ROW_GUTTER}px`
})

const PanelBody = styled('div')({
  display: 'block',
  width: '100%'
})

interface Props {
  children: ReactNode
  className?: string
  controls?: any
  label?: string
  casing?: CSSProperties['textTransform']
}

const Panel = (props: Props) => {
  const {children, className, controls, label, casing} = props

  return (
    <PanelRoot className={className}>
      {label && (
        <PanelHeader>
          <PanelLabel casing={casing}>{label}</PanelLabel>
          <PanelControls>{controls}</PanelControls>
        </PanelHeader>
      )}
      <PanelBody>{children}</PanelBody>
    </PanelRoot>
  )
}

export default Panel
