import {AddTemplatePrompt_prompts} from '__generated__/AddTemplatePrompt_prompts.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import LinkButton from 'universal/components/LinkButton'
import {typeScale} from 'universal/styles/theme/typography'
import dndNoise from 'universal/utils/dndNoise'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import AddReflectTemplatePromptMutation from 'universal/mutations/AddReflectTemplatePromptMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

const AddPromptLink = styled(LinkButton)({
  display: 'flex',
  fontSize: typeScale[5],
  margin: '.75rem 0',
  outline: 'none'
})

const AddPromptLinkPlus = styled('span')({
  display: 'block',
  margin: '0 .5rem 0 1.5rem',
  textAlign: 'center',
  width: '1rem'
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
        <AddPromptLinkPlus>+</AddPromptLinkPlus>
        <div>Add another prompt</div>
      </AddPromptLink>
    )
  }
}

export default createFragmentContainer(
  withMutationProps(withAtmosphere(AddTemplatePrompt)),
  graphql`
    fragment AddTemplatePrompt_prompts on RetroPhaseItem @relay(plural: true) {
      sortOrder
    }
  `
)
