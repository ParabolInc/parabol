import PropTypes from 'prop-types'
import React from 'react'
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles'
import makeUsername from 'universal/utils/makeUsername'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import Ellipsis from 'universal/components/Ellipsis/Ellipsis'

const CardBlock = styled('div')({
  ...CreateCardRootStyles,
  border: 0
})

const AddingHint = styled('div')({
  color: ui.hintColor,
  fontSize: ui.cardContentFontSize,
  textAlign: 'center'
})

const NullCard = (props) => {
  const {preferredName} = props
  const username = makeUsername(preferredName)
  return (
    <CardBlock>
      <AddingHint align='center' scale='s3' colorPalette='dark'>
        {'@'}
        {username}
        {' is adding a Task'}
        <Ellipsis />
      </AddingHint>
    </CardBlock>
  )
}

NullCard.propTypes = {
  preferredName: PropTypes.string
}

export default NullCard
