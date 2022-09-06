import styled from '@emotion/styled'
import React, {useState} from 'react'
import TextAreaAutoSize from 'react-textarea-autosize'
import useAtmosphere from '~/hooks/useAtmosphere'
import useForm from '../hooks/useForm'
import useMutationProps from '../hooks/useMutationProps'
import AddAgendaItemMutation from '../mutations/AddAgendaItemMutation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import toTeamMemberId from '../utils/relay/toTeamMemberId'
import DialogContainer from './DialogContainer'
import DialogContent from './DialogContent'
import DialogTitle from './DialogTitle'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import PrimaryButton from './PrimaryButton'
import PromptResponseEditor from './promptResponse/PromptResponseEditor'

const INVITE_DIALOG_BREAKPOINT = 864
const INVITE_DIALOG_MEDIA_QUERY = `@media (min-width: ${INVITE_DIALOG_BREAKPOINT}px)`

const StyledDialogTitle = styled(DialogTitle)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    fontSize: 24,
    lineHeight: '32px',
    marginBottom: 8,
    paddingLeft: 32,
    paddingTop: 24
  }
})

const StyledDialogContent = styled(DialogContent)({
  [INVITE_DIALOG_MEDIA_QUERY]: {
    alignItems: 'center',
    // display: 'flex',
    padding: '16px 32px 32px'
  }
})

const DescriptionWrapper = styled('div')({
  marginTop: '16px',
  borderStyle: 'solid',
  padding: '16px',
  borderColor: PALETTE.SLATE_500,
  borderWidth: 1,
  borderRadius: 8
})

const ButtonGroup = styled('div')({
  marginTop: '24px',
  display: 'flex',
  justifyContent: 'flex-end'
})

const StyledCopy = styled('p')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 15,
  lineHeight: '21px',
  padding: '0 0 16px',
  textTransform: 'none'
})

const TextArea = styled(TextAreaAutoSize)<{isDesktop: boolean}>(({isDesktop}) => ({
  backgroundColor: 'transparent',
  padding: 24,
  borderColor: PALETTE.SLATE_500,
  borderWidth: 1,
  borderRadius: 8,
  marginB: 24,
  display: 'block',
  fontSize: isDesktop ? 18 : 16,
  fontWeight: 400,
  lineHeight: '23.4px',
  outline: 'none',
  resize: 'none',
  width: '100%'
}))

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

const InputField = styled('input')<{disabled: boolean}>({
  boxShadow: 'none',
  display: 'block',
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '24px',
  margin: 0,
  outline: 'none',
  padding: '8px 8px 8px 43px',
  position: 'relative',
  textIndent: '4px',
  width: '100%'
})
const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover': {
    opacity: 0.5
  }
})

interface Props {
  onCloseModal: () => void
  teamId: string
}

const AddAgendaItemModal = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const {teamId, onCloseModal} = props

  const [description, setDescription] = useState({})

  const {fields, onChange} = useForm({
    newItem: {
      getDefault: () => ''
    }
  })

  const updateDescription = (editorState) => {
    setDescription(editorState.getJSON())
  }

  const addItem = () => {
    const content = fields.newItem.value.trim()
    if (submitting || !content) return
    submitMutation()
    const newAgendaItem = {
      content,
      descriptionContent: JSON.stringify(description),
      pinned: false,
      sortOrder: 0,
      teamId,
      teamMemberId: toTeamMemberId(teamId, atmosphere.viewerId)
    }
    AddAgendaItemMutation(atmosphere, {newAgendaItem}, {onError, onCompleted})
    onCloseModal()
  }

  return (
    <DialogContainer>
      <StyledDialogTitle>
        Add Agenda Item
        <StyledCloseButton onClick={onCloseModal}>
          <CloseIcon>close</CloseIcon>
        </StyledCloseButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <TextArea
          {...fields.newItem}
          onFocus={(e) => e.target.select()}
          name={'newItem'}
          autoFocus={true}
          maxLength={500}
          maxRows={3}
          onChange={onChange}
          placeholder={'What would you like to discuss?'}
        />

        <DescriptionWrapper>
          <PromptResponseEditor
            autoFocus={false}
            handleSubmit={updateDescription}
            content={description}
            readOnly={false}
            placeholder={'Provide some additional details...'}
          />
        </DescriptionWrapper>
        <ButtonGroup>
          <PrimaryButton onClick={addItem} disabled={false} size='medium'>
            {'Add Agenda Item'}
          </PrimaryButton>
        </ButtonGroup>
      </StyledDialogContent>
    </DialogContainer>
  )
}

export default AddAgendaItemModal
