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

class ArchiveTeamForm extends Component<Props> {
  validate = (value) =>
    // ignore case & smart quotes
    value.toLowerCase().replace('’', "'") !== this.props.teamName.toLowerCase().replace('’', "'")
      ? 'The team name entered was incorrect.'
      : undefined

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
