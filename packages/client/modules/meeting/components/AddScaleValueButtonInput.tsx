import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {AddScaleValueButtonInput_scale$key} from '~/__generated__/AddScaleValueButtonInput_scale.graphql'
import {Threshold} from '../../../types/constEnums'
import AddPokerTemplateScaleValue from './AddPokerTemplateScaleValue'
import NewTemplateScaleValueLabelInput from './NewTemplateScaleValueLabelInput'

interface Props {
  scale: AddScaleValueButtonInput_scale$key
}

const AddScaleValueButtonInput = (props: Props) => {
  const {scale: scaleRef} = props
  const scale = useFragment(
    graphql`
      fragment AddScaleValueButtonInput_scale on TemplateScale {
        ...NewTemplateScaleValueLabelInput_scale
        values {
          label
        }
      }
    `,
    scaleRef
  )
  const [isAdding, setIsAdding] = useState(false)
  const {values} = scale
  if (values.length >= Threshold.MAX_POKER_SCALE_VALUES) return null
  const closeAdding = () => {
    setIsAdding(false)
  }
  if (isAdding) {
    return <NewTemplateScaleValueLabelInput closeAdding={closeAdding} scale={scale} />
  }
  return <AddPokerTemplateScaleValue onClick={() => setIsAdding(true)} />
}

export default AddScaleValueButtonInput
