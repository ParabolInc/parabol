import {AddNewReflectTemplate_reflectTemplates} from '../../../__generated__/AddNewReflectTemplate_reflectTemplates.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import RaisedButton from '../../../components/RaisedButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {PALETTE} from '../../../styles/paletteV2'

const Error = styled('span')({
  color: PALETTE.ERROR_MAIN,
  display: 'block',
  fontSize: 12,
  margin: '0 0 8px'
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

  render() {
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

export default createFragmentContainer(withMutationProps(withAtmosphere(AddNewReflectTemplate)), {
  reflectTemplates: graphql`
    fragment AddNewReflectTemplate_reflectTemplates on ReflectTemplate @relay(plural: true) {
      name
    }
  `
})
