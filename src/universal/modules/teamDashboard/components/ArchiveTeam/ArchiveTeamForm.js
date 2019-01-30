// @flow
import React, {Component} from 'react'
import {reduxForm, Field} from 'redux-form'
import InputField from 'universal/components/InputField/InputField'

type Props = {
  handleFormBlur: () => any,
  handleFormSubmit: () => any,
  handleSubmit: (fn: () => any) => any,
  teamName: string
}

const normalize = (str) => str && str.toLowerCase().replace('’', "'")
class ArchiveTeamForm extends Component<Props> {
  validate = (value) => {
    // ignore case & smart quotes
    return normalize(value) !== normalize(this.props.teamName)
      ? 'The team name entered was incorrect.'
      : undefined
  }

  render () {
    const {handleFormSubmit, handleFormBlur, handleSubmit} = this.props
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Field
          autoFocus
          onBlur={handleFormBlur}
          label='Enter your team name to delete it.'
          component={InputField}
          name='archivedTeamName'
          placeholder='E.g. &quot;My Team&quot;'
          type='text'
          validate={this.validate}
        />
      </form>
    )
  }
}

export default reduxForm({form: 'archiveTeamConfirmation'})(ArchiveTeamForm)
