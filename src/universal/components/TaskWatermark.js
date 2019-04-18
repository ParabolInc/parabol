import React from 'react'
import FontAwesome from 'react-fontawesome'
import ui from 'universal/styles/ui'
import PropTypes from 'prop-types'
import styled from 'react-emotion'

const iconLookup = {
  github: 'github'
}

const WatermarkBlock = styled('div')({
  bottom: 0,
  left: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'absolute',
  right: 0,
  textAlign: 'center',
  top: 0,
  verticalAlign: 'middle',
  zIndex: ui.ziMenu - 2
})

const WatermarkIcon = styled(FontAwesome)({
  bottom: 0,
  color: ui.palette.mid,
  fontSize: '7rem !important',
  height: '8rem',
  lineHeight: '8rem !important',
  margin: 'auto -1.5rem -1.5rem auto',
  opacity: 0.2,
  position: 'absolute',
  right: 0,
  width: '8rem'
})

const TaskWatermark = (props) => {
  const {service} = props
  const iconName = iconLookup[service]
  if (!iconName) return null
  return (
    <WatermarkBlock>
      <WatermarkIcon name={iconName} />
    </WatermarkBlock>
  )
}

TaskWatermark.propTypes = {
  service: PropTypes.string
}

export default TaskWatermark
