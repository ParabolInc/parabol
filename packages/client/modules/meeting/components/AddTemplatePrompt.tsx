import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import {Threshold} from '~/types/constEnums'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import AddReflectTemplatePromptMutation from '../../../mutations/AddReflectTemplatePromptMutation'
import {ICON_SIZE} from '../../../styles/typographyV2'
import dndNoise from '../../../utils/dndNoise'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {AddTemplatePrompt_prompts} from '../../../__generated__/AddTemplatePrompt_prompts.graphql'

const AddPromptLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  fontSize: 18,
  margin: 0,
  marginBottom: 16,
  outline: 'none',
  paddingLeft: 32
})

const AddPromptLinkPlus = styled(Icon)({
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  lineHeight: ICON_SIZE.MD18,
  margin: '0 24px 0 16px',
  width: ICON_SIZE.MD18
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  prompts: AddTemplatePrompt_prompts
  templateId: string
}

class AddTemplatePrompt extends Component<Props> {
  addPrompt = () => {
    const {
      atmosphere,
      prompts,
      templateId,
      onError,
      onCompleted,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    submitMutation()
    const sortOrders = prompts.map(({sortOrder}) => sortOrder)
    const sortOrder = Math.max(0, ...sortOrders) + 1 + dndNoise()
    const promptCount = prompts.length
    AddReflectTemplatePromptMutation(
      atmosphere,
      {templateId},
      {
        promptCount,
        sortOrder,
        onError,
        onCompleted
      }
    )
  }

  render() {
    const {prompts, submitting} = this.props
    if (prompts.length >= Threshold.MAX_REFLECTION_PROMPTS) return null
    return (
      <AddPromptLink palette='blue' onClick={this.addPrompt} waiting={submitting}>
        <AddPromptLinkPlus>add</AddPromptLinkPlus>
        <div>Add another prompt</div>
      </AddPromptLink>
    )
  }
}

export default createFragmentContainer(withMutationProps(withAtmosphere(AddTemplatePrompt)), {
  prompts: graphql`
    fragment AddTemplatePrompt_prompts on RetroPhaseItem @relay(plural: true) {
      sortOrder
    }
  `
})
