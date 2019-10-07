import React, {Component} from 'react'
import {RouteComponentProps, withRouter} from 'react-router'
import BasicInput from '../../../../components/InputField/BasicInput'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ArchiveTeamMutation from '../../../../mutations/ArchiveTeamMutation'
import withForm, {WithFormProps} from '../../../../utils/relay/withForm'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import Legitity from '../../../../validation/Legitity'
import FieldLabel from '../../../../components/FieldLabel/FieldLabel'

interface Props
  extends WithAtmosphereProps,
    WithMutationProps,
    RouteComponentProps<{}>,
    WithFormProps {
  handleFormBlur: () => any
  teamName: string
  teamId: string
}

const normalize = (str) => str && str.toLowerCase().replace('’', "'")

class ArchiveTeamForm extends Component<Props> {
  onSubmit = (e: React.FormEvent) => {
    const {
      atmosphere,
      setDirtyField,
      history,
      submitting,
      submitMutation,
      onError,
      onCompleted,
      teamId,
      validateField
    } = this.props
    e.preventDefault()
    setDirtyField()
    const {archivedTeamName: res} = validateField()
    if (submitting || res.error) return
    submitMutation()
    ArchiveTeamMutation(atmosphere, {teamId}, {history, onError, onCompleted})
  }

  render () {
    const {
      handleFormBlur,
      onChange,
      fields: {archivedTeamName}
    } = this.props
    const {value, error, dirty} = archivedTeamName
    return (
      <form onSubmit={this.onSubmit}>
        <FieldLabel
          fieldSize='medium'
          htmlFor='archivedTeamName'
          indent
          inline
          label='Enter your team name to and hit Enter to delete it.'
        />
        <BasicInput
          value={value}
          error={dirty ? error : undefined}
          onChange={onChange}
          autoFocus
          onBlur={handleFormBlur}
          name='archivedTeamName'
          placeholder='E.g. "My Team"'
        />
      </form>
    )
  }
}

const form = withForm({
  archivedTeamName: {
    getDefault: () => '',
    validate: (rawInput, {teamName}) => {
      return new Legitity(rawInput)
        .normalize(normalize, 'err')
        .test((val) =>
          val === normalize(teamName) ? undefined : 'The team name entered was incorrect.'
        )
    }
  }
})
export default withAtmosphere(withMutationProps(withRouter(form(ArchiveTeamForm))))
