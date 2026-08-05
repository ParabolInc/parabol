import {Cancel as CancelIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {type FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV3'
import type {
  NewTemplateScaleValueLabelInput_scale$data,
  NewTemplateScaleValueLabelInput_scale$key
} from '../../../__generated__/NewTemplateScaleValueLabelInput_scale.graphql'
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'
import AddPokerTemplateScaleValueMutation from '../../../mutations/AddPokerTemplateScaleValueMutation'
import palettePickerOptions from '../../../styles/palettePickerOptions'
import {Threshold} from '../../../types/constEnums'
import isSpecialPokerLabel from '../../../utils/isSpecialPokerLabel'
import Legitity from '../../../validation/Legitity'
import EditableTemplateScaleValueColor from './EditableTemplateScaleValueColor'

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
    <div
      ref={ref}
      className='flex w-full cursor-pointer items-center px-4 py-2 text-[14px] leading-6'
    >
      <EditableTemplateScaleValueColor
        scale={scale}
        scaleValueColor={scaleValueColor}
        scaleValueLabel={newScaleValueLabel}
        setScaleValueColor={setScaleValueColor}
      />
      <form onSubmit={handleCreateNewLabel} className='flex w-full flex-col pl-4'>
        <input
          className='m-0 w-full appearance-none border-none bg-transparent p-0 text-[14px] text-fg-primary leading-6 outline-none'
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
        {error && <div className='text-[14px] text-fg-error'>{error.message}</div>}
      </form>
      <div
        className='ml-auto flex h-6 w-6 cursor-pointer items-center justify-center p-0 text-fg-secondary [&_svg]:text-[18px]'
        onClick={closeAdding}
      >
        <CancelIcon />
      </div>
    </div>
  )
}

export default NewTemplateScaleValueLabelInput
