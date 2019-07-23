import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import Action from 'universal/components/Action/Action'
import globalStyles from 'universal/styles/theme/globalStyles'
import {css, Global} from '@emotion/core'

class ActionContainer extends Component {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired,
    params: PropTypes.object
  }

  constructor (props) {
    super(props)
  }

  render () {
    return (
      <React.Fragment>
        <Global
          styles={css`
            ${globalStyles}
          `}
        />
        <Action {...this.props} />
      </React.Fragment>
    )
  }
}

export default withRouter(ActionContainer)
