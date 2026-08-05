import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {EditableTemplateScaleName_scales$key} from '../../../__generated__/EditableTemplateScaleName_scales.graphql'
import EditableText from '../../../components/EditableText'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RenamePokerTemplateScaleMutation from '../../../mutations/RenamePokerTemplateScaleMutation'
import Legitity from '../../../validation/Legitity'

interface Props {
  name: string
  scaleId: string
  scales: EditableTemplateScaleName_scales$key
  isOwner: boolean
}

const EditableTemplateScaleName = (props: Props) => {
  const {name, scaleId, scales: scalesRef, isOwner} = props
  const scales = useFragment(
    graphql`
      fragment EditableTemplateScaleName_scales on TemplateScale @relay(plural: true) {
        id
        name
      }
    `,
    scalesRef
  )
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawName: string) => {
    if (submitting) return
    const {error, value: name} = validate(rawName)
    if (error) return
    submitMutation()
    RenamePokerTemplateScaleMutation(atmosphere, {scaleId, name}, {onError, onCompleted})
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a scale name')
      .max(50, 'That scale name is probably long enough')
      .test((mVal) => {
        const isDupe = !scales
          ? undefined
          : scales.find(
              (scale) => scale.id !== scaleId && scale.name.toLowerCase() === mVal.toLowerCase()
            )
        return isDupe ? 'That scale name is already taken' : undefined
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

  return (
    <div className='flex-1 pt-1 font-semibold text-[20px] leading-6'>
      <EditableText
        className='leading-6'
        disabled={!isOwner}
        error={error?.message}
        handleSubmit={handleSubmit}
        initialValue={name}
        maxLength={50}
        validate={validate}
        placeholder={'*New Scale'}
      />
    </div>
  )
}

export default EditableTemplateScaleName
