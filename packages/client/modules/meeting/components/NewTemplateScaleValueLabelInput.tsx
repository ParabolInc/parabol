import React, {FormEvent, useEffect, useRef, useState} from 'react'
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
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'

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

const predictNextLabel = (values: NewTemplateScaleValueLabelInput_scale['values']) => {
  const existingLabels = values.filter(({isSpecial}) => !isSpecial).map(({label}) => label)
  const potentialNextLabel = Number(existingLabels[existingLabels.length - 1]) + 1
  const isNextLabelValid = !isNaN(potentialNextLabel) ? (potentialNextLabel >= 0 && potentialNextLabel < 100 && !existingLabels.includes(String(potentialNextLabel))) : false
  return isNextLabelValid ? potentialNextLabel.toString() : 'Enter a new scale value'
}
interface Props {
  closeAdding: () => void
  scale: NewTemplateScaleValueLabelInput_scale
}

const NewTemplateScaleValueLabelInput = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {error, onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const {closeAdding, scale} = props
  const {id: scaleId, values} = scale
  const [newScaleValueLabel, setNewScaleValueLabel] = useState("")
  const [scaleValueColor, setScaleValueColor] = useState("")
  const isEmpty = !newScaleValueLabel
  useEffect(() => {
    const pickedColors = values.filter(({isSpecial}) => !isSpecial).map(({color}) => color)
    const hexColors = palettePickerOptions.map(({hex}) => hex)
    const lastColor = pickedColors[pickedColors.length - 1] || PALETTE.PROMPT_GREEN
    const availableNewColor = hexColors.find((hex) => !pickedColors.includes(hex)) || lastColor
    setScaleValueColor(availableNewColor)
  }, [scale])

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a value')
      .max(2, 'Value cannot be longer than 2 characters')
      .test((mVal) => {
        if (!mVal) return undefined
        const isDupe = values.find(
          (scaleValue) => scaleValue.label.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That value already exists' : undefined
      })
  }

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else {
      onCompleted()
    }
    return res
  }

  const handleKeyDown = useEventCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeAdding()
    }
  })

  const handleCreateNewLabel = (e: FormEvent) => {
    e.preventDefault()
    const {error} = validate(newScaleValueLabel)
    if (submitting || error) return
    submitMutation()
    const scaleValue = {
      color: scaleValueColor,
      label: newScaleValueLabel,
      isSpecial: false
    }
    setNewScaleValueLabel("")
    AddPokerTemplateScaleValueMutation(
      atmosphere,
      {scaleId, scaleValue},
      {
        onError,
        onCompleted
      }
    )
  }
  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, isEmpty)
  const placeholder = predictNextLabel(values)
  return (
    <NewScaleValueInput ref={ref}>
      <EditableTemplateScaleValueColor isOwner scale={scale}
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
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          value={newScaleValueLabel}
          type='text'
        />
        {error && <StyledError>{error.message}</StyledError>}
      </Form>
      <RemoveScaleValueIcon onClick={closeAdding}>
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
