import PropTypes from 'prop-types'
import React from 'react'

const style = {
  backgroundColor: 'rgba(248, 221, 180, .6)', // TODO: theme-able?
  borderRadius: '.0625rem',
  fontWeight: 600
}

const Mention = (props) => {
  // const {url} = props.contentState.getEntity(props.entityKey).getData();
  const {offsetkey, children} = props
  return (
    <span data-offset-key={offsetkey} style={style}>
      {children}
    </span>
  )
}

Mention.propTypes = {
  children: PropTypes.any,
  offsetkey: PropTypes.string
}

export default Mention
