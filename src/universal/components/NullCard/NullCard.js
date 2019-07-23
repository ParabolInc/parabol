import PropTypes from 'prop-types'
import React from 'react'
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles'
import styled from '@emotion/styled'
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
  return (
    <CardBlock>
      <AddingHint align='center' scale='s3' colorPalette='dark'>
        {preferredName}
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
