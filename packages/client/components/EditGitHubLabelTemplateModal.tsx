import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import useForm from '../hooks/useForm'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import BasicInput from './InputField/BasicInput'
import PlainButton from './PlainButton/PlainButton'
import RaisedButton from './RaisedButton'
import SecondaryButton from './SecondaryButton'

interface Props {
  closePortal: () => void
  updateLabelTemplate: (labelTemplate: string) => () => void
  defaultValue: string
  placeholder: string
}

const StyledDialogContainer = styled(DialogContainer)({
  width: 480
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const StyledTip = styled('span')({
  fontSize: 16,
  margin: 0,
  padding: 4
})

const WildcardTip = styled(StyledTip)({
  background: PALETTE.SLATE_300,
  borderRadius: 8,
  fontWeight: 600
})
const StyledRaisedButton = styled(RaisedButton)({
  marginLeft: 16
})

const LabelTemplateInput = styled(BasicInput)({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  marginBottom: 8,
  outline: 0,
  backgroundColor: 'transparent',
  width: '100%'
})

const EditGitHubLabelTemplateModal = (props: Props) => {
  const {closePortal, defaultValue, placeholder, updateLabelTemplate} = props
  const INPUT_NAME = 'labelTemplate'
  const {fields, onChange, setValue} = useForm({
    [INPUT_NAME]: {
      getDefault: () => defaultValue
    }
  })
  const labelTemplateField = fields[INPUT_NAME]
  const {value} = labelTemplateField
  const onSave = () => {
    // validate?

    updateLabelTemplate(value)()
  }
  const addWildcard = () => {
    setValue(INPUT_NAME, `${value} {{#}}`)
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{'Edit GitHub Label'}</DialogTitle>
      <DialogContent>
        <div>
          <LabelTemplateInput
            autoFocus
            name={INPUT_NAME}
            placeholder={placeholder}
            type={'text'}
            autoComplete={'off'}
            onChange={onChange}
            value={value}
            error={undefined}
          />
          <StyledTip>{'Use '}</StyledTip>
          <PlainButton onClick={addWildcard}>
            <WildcardTip>{'{{#}}'}</WildcardTip>
          </PlainButton>
          <StyledTip>{' as the value wildcard'}</StyledTip>

          <ButtonGroup>
            <SecondaryButton onClick={closePortal} size='medium'>
              Cancel
            </SecondaryButton>
            <StyledRaisedButton onClick={onSave} size='medium' palette={'blue'}>
              Save
            </StyledRaisedButton>
          </ButtonGroup>
        </div>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default EditGitHubLabelTemplateModal
