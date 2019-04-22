import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {panelShadow} from 'universal/styles/elevation'
import appTheme from 'universal/styles/theme/appTheme'
import Badge from 'universal/components/Badge/Badge'
import {ROW_GUTTER, ROW_GUTTER_COMPACT} from 'universal/styles/rows'

const PanelRoot = styled('div')({
  backgroundColor: 'white',
  boxShadow: panelShadow,
  borderRadius: 4,
  fontSize: appTheme.typography.s3,
  lineHeight: appTheme.typography.s5,
  margin: '24px 0',
  position: 'relative',
  width: '100%'
})

const PanelHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  width: '100%'
})

const PanelLabel = styled('div')(({compact}) => ({
  color: ui.labelHeadingColor,
  fontSize: ui.labelHeadingFontSize,
  fontWeight: ui.labelHeadingFontWeight,
  letterSpacing: ui.labelHeadingLetterSpacing,
  lineHeight: ui.labelHeadingLineHeight,
  padding: `12px ${compact ? ROW_GUTTER_COMPACT : ROW_GUTTER}px`,
  textTransform: 'uppercase'
}))

const PanelControls = styled('div')(({compact}) => {
  const padding = compact ? ROW_GUTTER_COMPACT : ROW_GUTTER
  return {
    display: 'flex',
    flex: 1,
    height: '2.75rem',
    justifyContent: 'flex-end',
    lineHeight: '2.75rem',
    padding: `0 ${padding}px`
  }
})

const PanelBody = styled('div')(({hideFirstRowBorder}) => ({
  display: 'block',
  marginTop: hideFirstRowBorder && '-.0625rem',
  width: '100%'
}))

const Panel = (props) => {
  const {badgeCount, children, compact, controls, hideFirstRowBorder, label} = props

  return (
    <PanelRoot>
      {label && (
        <PanelHeader>
          <PanelLabel compact={compact}>{label}</PanelLabel>
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
      <PanelBody hideFirstRowBorder={hideFirstRowBorder}>{children}</PanelBody>
    </PanelRoot>
  )
}

Panel.propTypes = {
  badgeCount: PropTypes.number,
  children: PropTypes.any,
  compact: PropTypes.bool,
  controls: PropTypes.any,
  hideFirstRowBorder: PropTypes.bool,
  label: PropTypes.any
}

export default Panel
