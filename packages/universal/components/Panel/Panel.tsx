import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import Badge from 'universal/components/Badge/Badge'
import LabelHeading from 'universal/components/LabelHeading/LabelHeading'
import {panelShadow} from 'universal/styles/elevation'
import {Layout} from 'universal/types/constEnums'

const PanelRoot = styled('div')({
  backgroundColor: 'white',
  boxShadow: panelShadow,
  borderRadius: 4,
  fontSize: 14,
  lineHeight: '20px',
  margin: '24px 0',
  position: 'relative',
  width: '100%'
})

const PanelHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const PanelLabel = styled(LabelHeading)({
  padding: `12px ${Layout.ROW_GUTTER}px`,
  textTransform: 'uppercase'
})

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
  badgeCount?: number
  children: ReactNode
  className?: string
  controls?: any
  label?: any
}

const Panel = (props: Props) => {
  const {badgeCount, children, className, controls, label} = props

  return (
    <PanelRoot className={className}>
      {label && (
        <PanelHeader>
          <PanelLabel>{label}</PanelLabel>
          {badgeCount && <Badge colorPalette='midGray' value={badgeCount} />}
          <PanelControls>{controls}</PanelControls>
        </PanelHeader>
      )}
      <PanelBody>{children}</PanelBody>
    </PanelRoot>
  )
}

export default Panel
