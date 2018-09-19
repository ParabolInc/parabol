import React, {Component} from 'react'
import styled from 'react-emotion'
import FieldLabel from 'universal/components/FieldLabel/FieldLabel'
import ui from 'universal/styles/ui'
import BasicTextArea from 'universal/components/InputField/BasicTextArea'

const TextAreaBlock = styled('div')({
  margin: '2rem auto'
})

interface Props {
  dirty: boolean
  error: string | undefined

  onChange (e: React.ChangeEvent<HTMLTextAreaElement>): void

  placeholder: string
  rawInvitees: string

  onBlur (e: React.FocusEvent<HTMLTextAreaElement>): void
}

class NewTeamFormInvitees extends Component<Props> {
  render () {
    const {dirty, error, onBlur, placeholder, rawInvitees, onChange} = this.props
    return (
      <TextAreaBlock>
        <FieldLabel
          customStyles={{paddingBottom: ui.fieldLabelGutter}}
          fieldSize='medium'
          htmlFor='rawInvitees'
          indent
          label={'Invite Team Members (optional)'}
        />
        <BasicTextArea
          error={dirty ? error : undefined}
          name='rawInvitees'
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          value={rawInvitees}
        />
      </TextAreaBlock>
    )
  }
}

export default NewTeamFormInvitees
