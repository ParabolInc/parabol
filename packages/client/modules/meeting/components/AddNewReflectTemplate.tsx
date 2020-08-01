import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import Icon from '../../../components/Icon'
import RaisedButton from '../../../components/RaisedButton'
import withAtmosphere, {WithAtmosphereProps} from '../../../decorators/withAtmosphere/withAtmosphere'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {AddNewReflectTemplate_reflectTemplates} from '../../../__generated__/AddNewReflectTemplate_reflectTemplates.graphql'

const Error = styled('span')({
  color: PALETTE.ERROR_MAIN,
  display: 'block',
  fontSize: 12,
  margin: '0 0 8px'
})

const ButtonBlock = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '8px 16px',
  width: '100%'
})

const Button = styled(RaisedButton)({
  display: 'flex',
  // width: '100%'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  marginRight: 8,
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
    AddReflectTemplateMutation(atmosphere, {teamId}, {onError, onCompleted})
  }

  render() {
    const {error, submitting} = this.props
    return (
      <ButtonBlock>
        {error && <Error>{error}</Error>}
        <Button onClick={this.addNewTemplate} palette='blue' waiting={submitting}>
          <StyledIcon>add</StyledIcon>
          Add new template
        </Button>
      </ButtonBlock>
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
