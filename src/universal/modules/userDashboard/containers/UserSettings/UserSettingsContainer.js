import PropTypes from 'prop-types'
import raven from 'raven-js'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import {initialize, reduxForm} from 'redux-form'
import UserSettings from 'universal/modules/userDashboard/components/UserSettings/UserSettings'
import UpdateUserProfileMutation from 'universal/mutations/UpdateUserProfileMutation'
import makeUpdatedUserSchema from 'universal/validation/makeUpdatedUserSchema'
import shouldValidate from 'universal/validation/shouldValidate'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import getGraphQLError from 'universal/utils/relay/getGraphQLError'
import {connect} from 'react-redux'

const validate = (values) => {
  const schema = makeUpdatedUserSchema()
  return schema(values).errors
}

class UserSettingsContainer extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func,
    untouch: PropTypes.func,
    viewer: PropTypes.object.isRequired
  }

  componentWillMount () {
    this.initializeForm()
  }

  onSubmit = async (submissionData) => {
    const {untouch, atmosphere, viewer} = this.props
    const {preferredName} = submissionData
    if (preferredName === viewer.preferredName) {
      return undefined
    }
    return new Promise((resolve, reject) => {
      const onError = (err) => {
        raven.captureException(err)
        reject(err)
      }
      const onCompleted = (res, errors) => {
        const serverError = getGraphQLError(res, errors)
        if (serverError) {
          onError(serverError.message)
          return
        }
        untouch('preferredName')
        resolve()
      }
      const updatedUser = {preferredName}
      UpdateUserProfileMutation(atmosphere, updatedUser, onError, onCompleted)
    })
  }

  initializeForm () {
    const {
      dispatch,
      viewer: {preferredName}
    } = this.props
    return dispatch(initialize('userSettings', {preferredName}))
  }

  render () {
    return <UserSettings {...this.props} onSubmit={this.onSubmit} />
  }
}

export default createFragmentContainer(
  withAtmosphere(
    connect()(reduxForm({form: 'userSettings', shouldValidate, validate})(UserSettingsContainer))
  ),
  graphql`
    fragment UserSettingsContainer_viewer on User {
      preferredName
      ...UserSettings_viewer
    }
  `
)
