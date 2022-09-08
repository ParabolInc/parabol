import styled from '@emotion/styled'
import React from 'react'
import {useTranslation} from 'react-i18next'
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

  const {t} = useTranslation()

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
    setValue(
      INPUT_NAME,
      t('EditGitHubLabelTemplateModal.Value', {
        value
      })
    )
  }
  return (
    <StyledDialogContainer>
      <DialogTitle>{t('EditGitHubLabelTemplateModal.EditGitHubLabel')}</DialogTitle>
      <DialogContent>
        <div>
          <LabelTemplateInput
            autoFocus
            name={INPUT_NAME}
            placeholder={placeholder}
            type={t('EditGitHubLabelTemplateModal.Text')}
            autoComplete={t('EditGitHubLabelTemplateModal.Off')}
            onChange={onChange}
            value={value}
            error={undefined}
          />
          <StyledTip>{t('EditGitHubLabelTemplateModal.Use')}</StyledTip>
          <PlainButton onClick={addWildcard}>
            <WildcardTip>{'{{#}}'}</WildcardTip>
          </PlainButton>
          <StyledTip>{t('EditGitHubLabelTemplateModal.AsTheValueWildcard')}</StyledTip>

          <ButtonGroup>
            <SecondaryButton onClick={closePortal} size='medium'>
              {t('EditGitHubLabelTemplateModal.Cancel')}
            </SecondaryButton>
            <StyledRaisedButton
              onClick={onSave}
              size='medium'
              palette={t('EditGitHubLabelTemplateModal.Blue')}
            >
              {t('EditGitHubLabelTemplateModal.Save')}
            </StyledRaisedButton>
          </ButtonGroup>
        </div>
      </DialogContent>
    </StyledDialogContainer>
  )
}

export default EditGitHubLabelTemplateModal
