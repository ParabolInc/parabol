import {AddNewReflectTemplate_reflectTemplates} from '__generated__/AddNewReflectTemplate_reflectTemplates.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import RaisedButton from 'universal/components/RaisedButton'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import AddReflectTemplateMutation from 'universal/mutations/AddReflectTemplateMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {PALETTE} from 'universal/styles/paletteV2'
import {typeScale} from 'universal/styles/theme/typography'

const Error = styled('span')({
  color: PALETTE.ERROR.MAIN,
  display: 'block',
  fontSize: typeScale[1],
  margin: '0 0 .5rem'
})

const Button = styled(RaisedButton)({
  display: 'block',
  width: '100%'
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  reflectTemplates: AddNewReflectTemplate_reflectTemplates
  teamId: string
}

class AddNewReflectTemplate extends Component<Props> {
  addNewTemplate = () => {
    const {
      atmosphere,
      onError,
      onCompleted,
      submitMutation,
      submitting,
      teamId,
      reflectTemplates
    } = this.props
    if (submitting) return
    if (reflectTemplates.length >= 20) {
      onError('You may only have 20 templates per team. Please remove one first.')
      return
    }
    if (reflectTemplates.find((template) => template.name === '*New Template')) {
      onError('You already have a new template. Try renaming that one first.')
      return
    }
    submitMutation()
    AddReflectTemplateMutation(atmosphere, {teamId}, {}, onError, onCompleted)
  }

  render () {
    const {error, submitting} = this.props
    return (
      <React.Fragment>
        {error && <Error>{error}</Error>}
        <Button onClick={this.addNewTemplate} palette='blue' waiting={submitting}>
          + Add new template
        </Button>
      </React.Fragment>
    )
  }
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(AddNewReflectTemplate)),
  graphql`
    fragment AddNewReflectTemplate_reflectTemplates on ReflectTemplate @relay(plural: true) {
      name
    }
  `
)
