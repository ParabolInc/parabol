import {AddTemplatePrompt_prompts} from '../../../__generated__/AddTemplatePrompt_prompts.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import LinkButton from '../../../components/LinkButton'
import {typeScale} from '../../../styles/theme/typography'
import dndNoise from '../../../utils/dndNoise'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import AddReflectTemplatePromptMutation from '../../../mutations/AddReflectTemplatePromptMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Icon from '../../../components/Icon'
import {MD_ICONS_SIZE_18} from '../../../styles/icons'

const AddPromptLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  fontSize: typeScale[5],
  margin: 0,
  marginBottom: 16,
  outline: 'none'
})

const AddPromptLinkPlus = styled(Icon)({
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  lineHeight: MD_ICONS_SIZE_18,
  margin: '0 .5rem 0 1.375rem',
  width: MD_ICONS_SIZE_18
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
    const sortOrder = Math.max(...sortOrders) + 1 + dndNoise()
    const promptCount = prompts.length
    AddReflectTemplatePromptMutation(
      atmosphere,
      {templateId},
      {promptCount, sortOrder},
      onError,
      onCompleted
    )
  }

  render () {
    const {prompts, submitting} = this.props
    if (prompts.length >= 5) return null
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
