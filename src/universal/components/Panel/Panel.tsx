import React, {ReactNode} from 'react'
import styled from 'react-emotion'
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

const PanelBody = styled('div')(({hideFirstRowBorder}: {hideFirstRowBorder: boolean}) => ({
  display: 'block',
  marginTop: hideFirstRowBorder ? '-1px' : undefined,
  width: '100%'
}))

interface Props {
  badgeCount?: number
  children: ReactNode
  controls?: any
  hideFirstRowBorder?: boolean
  label?: any
}

const Panel = (props: Props) => {
  const {badgeCount, children, controls, hideFirstRowBorder, label} = props

  return (
    <PanelRoot>
      {label && (
        <PanelHeader>
          <PanelLabel>{label}</PanelLabel>
          {badgeCount && <Badge colorPalette='midGray' value={badgeCount} />}
          <PanelControls>{controls}</PanelControls>
        </PanelHeader>
      )}
      {/*
          NOTE: “hideFirstRowBorder”
          children may only be a set of rows,
          and in the absense of a panel header,
          we may want to avoid fuzzies by hiding
          the first row’s top border
      */}
      <PanelBody hideFirstRowBorder={!!hideFirstRowBorder}>{children}</PanelBody>
    </PanelRoot>
  )
}

export default Panel
