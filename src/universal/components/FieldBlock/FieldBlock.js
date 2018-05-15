import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'

const FieldBlockStyles = styled('div')({
  margin: '0 auto',
  maxWidth: '100%',
  width: '100%'
})

const FieldBlock = (props) => {
  const {children} = props
  return <FieldBlockStyles>{children}</FieldBlockStyles>
}

FieldBlock.propTypes = {
  children: PropTypes.any
}

export default FieldBlock
