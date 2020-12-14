import React, {FormEvent, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import {createFragmentContainer} from 'react-relay'
import useMutationProps from '~/hooks/useMutationProps'
import useAtmosphere from '~/hooks/useAtmosphere'
import AddPokerTemplateScaleValueMutation from '../../../mutations/AddPokerTemplateScaleValueMutation'
import {NewTemplateScaleValueLabelInput_scale} from '../../../__generated__/NewTemplateScaleValueLabelInput_scale.graphql'
import EditableTemplateScaleValueColor from './EditableTemplateScaleValueColor'
import palettePickerOptions from '../../../styles/palettePickerOptions'
import Icon from '../../../components/Icon'
import {ICON_SIZE} from '../../../styles/typographyV2'
import Legitity from '../../../validation/Legitity'
import useEventCallback from '../../../hooks/useEventCallback'

const Form = styled('form')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const StyledError = styled('div')({
  color: PALETTE.ERROR_MAIN,
  fontSize: 14
})

const NewScaleValueInput = styled('div')({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  fontSize: 14,
  lineHeight: '24px',
  padding: '8px 16px',
  width: '100%'
})

const ScaleValueInputBox = styled('input')({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: PALETTE.TEXT_MAIN,
  fontSize: 14,
  lineHeight: '24px',
  margin: 0,
  padding: 0,
  outline: 0,
  width: '100%'
})

const RemoveScaleValueIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  height: ICON_SIZE.MD24,
  width: ICON_SIZE.MD24,
  lineHeight: '24px',
  marginLeft: 'auto',
  padding: 0,
  textAlign: 'center',
})

interface Props {
  isOwner: boolean
  isEditing: boolean
  setIsEditing: (isEditing: boolean) => void
  isHover: boolean
  scale: NewTemplateScaleValueLabelInput_scale
}

const NewTemplateScaleValueLabelInput = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {error, onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const {isEditing, setIsEditing, scale} = props
  const [newScaleValueLabel, setNewScaleValueLabel] = useState("")
  const [scaleValueColor, setScaleValueColor] = useState("")

  React.useEffect(() => {
    const pickedColors = scale.values.filter(({isSpecial}) => !isSpecial).map(({color}) => color)
    const availableNewColor = palettePickerOptions.find(
      (color) => !pickedColors.includes(color.hex)
    )
    setScaleValueColor(availableNewColor?.hex || PALETTE.PROMPT_GREEN)
  }, [scale])

  const makeHandleCompleted = (onCompleted: () => void) => () => {
    onCompleted()
    setNewScaleValueLabel("")
    setIsEditing(true)
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a value')
      .max(2, 'Value cannot be longer than 2 characters')
      .test((mVal) => {
        const isDupe = mVal ? scale.values.find(
          (scaleValue) => scaleValue.label.toLowerCase() === mVal.toLowerCase()
        ) : undefined
        return isDupe ? 'That value already exists' : undefined
      })
  }

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else if (error) {
      onError()
    }
    return res
  }

  const handleKeyDown = useEventCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
  })

  const handleCreateNewLabel = (e: FormEvent) => {
    e.preventDefault()
    const {error} = validate(newScaleValueLabel)
    if (error || !newScaleValueLabel.length) {
      setIsEditing(false)
      return
    }

    if (submitting) return
    submitMutation()

    const scaleValue = {
      color: scaleValueColor,
      label: newScaleValueLabel,
      isSpecial: false
    }
    const handleCompleted = makeHandleCompleted(onCompleted)
    AddPokerTemplateScaleValueMutation(
      atmosphere,
      {scaleId: scale.id, scaleValue},
      {
        onError,
        onCompleted: handleCompleted
      }
    )
  }

  const existingLabels = scale.values.filter(({isSpecial}) => !isSpecial).map(({label}) => label)
  const potentialNextLabel = Number(existingLabels[existingLabels.length - 1]) + 1
  const isNextLabelValid = !isNaN(potentialNextLabel) ? (potentialNextLabel >= 0 && potentialNextLabel < 100) : false
  const nextLabel = isNextLabelValid ? potentialNextLabel.toString() : 'Enter a new scale value'


  if (!isEditing) return null
  return (
    <NewScaleValueInput>
      <EditableTemplateScaleValueColor isOwner={true} scale={scale}
        scaleValueColor={scaleValueColor} scaleValueLabel={newScaleValueLabel}
        setScaleValueColor={setScaleValueColor}
      />
      <Form onSubmit={handleCreateNewLabel}>
        <ScaleValueInputBox
          autoFocus
          onChange={(e) => {
            setNewScaleValueLabel(e.target.value)
            validate(e.target.value)
          }}
          placeholder={nextLabel}
          onKeyDown={handleKeyDown}
          type='text'
        />
        {error && <StyledError>{error.message}</StyledError>}
      </Form>
      <RemoveScaleValueIcon onClick={() => setIsEditing(false)}>
        cancel
      </RemoveScaleValueIcon>
    </NewScaleValueInput>
  )
}

export default createFragmentContainer(NewTemplateScaleValueLabelInput, {
  scale: graphql`
    fragment NewTemplateScaleValueLabelInput_scale on TemplateScale {
      ...EditableTemplateScaleValueColor_scale
      id
      values {
        id
        label
        color
        sortOrder
        isSpecial
      }
    }
  `
})