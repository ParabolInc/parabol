import styled from '@emotion/styled'
import {Cancel as CancelIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV3'
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'
import AddPokerTemplateScaleValueMutation from '../../../mutations/AddPokerTemplateScaleValueMutation'
import palettePickerOptions from '../../../styles/palettePickerOptions'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'
import Legitity from '../../../validation/Legitity'
import {
  NewTemplateScaleValueLabelInput_scale$key,
  NewTemplateScaleValueLabelInput_scale$data
} from '../../../__generated__/NewTemplateScaleValueLabelInput_scale.graphql'
import EditableTemplateScaleValueColor from './EditableTemplateScaleValueColor'
import {Threshold} from '../../../types/constEnums'

const Form = styled('form')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const StyledError = styled('div')({
  color: PALETTE.TOMATO_500,
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
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '24px',
  margin: 0,
  padding: 0,
  outline: 0,
  width: '100%'
})

const RemoveScaleValueIcon = styled('div')({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  svg: {
    fontSize: 18
  },
  height: 24,
  width: 24,
  marginLeft: 'auto',
  padding: 0
})

const predictNextLabel = (values: NewTemplateScaleValueLabelInput_scale$data['values']) => {
  const existingLabels = values
    .map(({label}) => label)
    .filter((label) => !isSpecialPokerLabel(label))
  const potentialNextLabel = Number(existingLabels[existingLabels.length - 1]) + 1
  const isNextLabelValid = !isNaN(potentialNextLabel)
    ? potentialNextLabel >= 0 &&
      potentialNextLabel < 100 &&
      !existingLabels.includes(String(potentialNextLabel))
    : false
  return isNextLabelValid ? potentialNextLabel.toString() : 'Enter a new scale value'
}
interface Props {
  closeAdding: () => void
  scale: NewTemplateScaleValueLabelInput_scale$key
}

const NewTemplateScaleValueLabelInput = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {error, onError, onCompleted, submitMutation, submitting} = useMutationProps()
  const {closeAdding, scale: scaleRef} = props
  const scale = useFragment(
    graphql`
      fragment NewTemplateScaleValueLabelInput_scale on TemplateScale {
        ...EditableTemplateScaleValueColor_scale
        id
        values {
          id
          label
          color
          sortOrder
        }
      }
    `,
    scaleRef
  )
  const {id: scaleId, values} = scale
  const [newScaleValueLabel, setNewScaleValueLabel] = useState('')
  const [scaleValueColor, setScaleValueColor] = useState('')
  const isEmpty = !newScaleValueLabel
  useEffect(() => {
    const pickedColors = values
      .filter(({label}) => !isSpecialPokerLabel(label))
      .map(({color}) => color)
    const hexColors = palettePickerOptions.map(({hex}) => hex)
    const lastColor = pickedColors[pickedColors.length - 1] || PALETTE.JADE_400
    const availableNewColor = hexColors.find((hex) => !pickedColors.includes(hex)) || lastColor
    setScaleValueColor(availableNewColor)
  }, [scale])

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a value')
      .max(
        Threshold.POKER_SCALE_VALUE_MAX_LENGTH,
        `Value cannot be longer than ${Threshold.POKER_SCALE_VALUE_MAX_LENGTH} characters`
      )
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

  const handleBlur = (e: React.FocusEvent) => {
    if (!isEmpty) {
      handleCreateNewLabel(e)
    }
    closeAdding()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      closeAdding()
    }
  }

  const handleCreateNewLabel = (e: FormEvent) => {
    e.preventDefault()
    const {error} = validate(newScaleValueLabel)
    if (submitting || error) return
    submitMutation()
    const scaleValue = {
      color: scaleValueColor,
      label: newScaleValueLabel
    }
    setNewScaleValueLabel('')
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
      <EditableTemplateScaleValueColor
        scale={scale}
        scaleValueColor={scaleValueColor}
        scaleValueLabel={newScaleValueLabel}
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
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          value={newScaleValueLabel}
          type='text'
        />
        {error && <StyledError>{error.message}</StyledError>}
      </Form>
      <RemoveScaleValueIcon onClick={closeAdding}>
        <CancelIcon />
      </RemoveScaleValueIcon>
    </NewScaleValueInput>
  )
}

export default NewTemplateScaleValueLabelInput
