import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {EditableTemplateDimension_dimensions$key} from '../../../__generated__/EditableTemplateDimension_dimensions.graphql'
import EditableText from '../../../components/EditableText'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useScrollIntoView from '../../../hooks/useScrollIntoVIew'
import RenamePokerTemplateDimensionMutation from '../../../mutations/RenamePokerTemplateDimensionMutation'
import Legitity from '../../../validation/Legitity'

interface Props {
  isOwner: boolean
  isEditingDescription: boolean
  isHover: boolean
  dimensionName: string
  dimensionId: string
  dimensions: EditableTemplateDimension_dimensions$key
}

const EditableTemplateDimension = (props: Props) => {
  const {
    dimensionId,
    dimensions: dimensionsRef,
    isOwner,
    isHover,
    isEditingDescription,
    dimensionName
  } = props
  const dimensions = useFragment(
    graphql`
      fragment EditableTemplateDimension_dimensions on TemplateDimension @relay(plural: true) {
        id
        name
      }
    `,
    dimensionsRef
  )
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawDimensionName: string) => {
    if (submitting) return
    const {error, value: name} = validate(rawDimensionName)
    if (error) return
    submitMutation()
    RenamePokerTemplateDimensionMutation(atmosphere, {dimensionId, name}, {onError, onCompleted})
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a dimension name')
      .max(100, 'That dimension name is probably long enough')
      .test((mVal) => {
        const isDupe = dimensions.find(
          (dimension) =>
            dimension.id !== dimensionId && dimension.name.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That dimension already exists' : undefined
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

  const autoFocus = dimensionName.startsWith('*New Dimension #')
  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, autoFocus)
  return (
    <EditableText
      className='p-0 text-sm leading-6'
      ref={ref}
      autoFocus={autoFocus}
      disabled={!isOwner}
      error={error?.message}
      hideIcon={isEditingDescription ? true : !isHover}
      handleSubmit={handleSubmit}
      initialValue={dimensionName}
      maxLength={50}
      validate={validate}
      placeholder={dimensionName}
    />
  )
}

export default EditableTemplateDimension
