import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Threshold} from '~/types/constEnums'
import {Button} from '~/ui/Button/Button'
import {Add} from '~/ui/icons'
import type {AddPokerTemplateDimension_dimensions$key} from '../../../__generated__/AddPokerTemplateDimension_dimensions.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateDimensionMutation from '../../../mutations/AddPokerTemplateDimensionMutation'
import {positionAfter} from '../../../shared/sortOrder'

interface Props {
  dimensions: AddPokerTemplateDimension_dimensions$key
  templateId: string
}

const AddPokerTemplateDimension = (props: Props) => {
  const {dimensions: dimensionsRef, templateId} = props
  const dimensions = useFragment(
    graphql`
      fragment AddPokerTemplateDimension_dimensions on TemplateDimension @relay(plural: true) {
        sortOrder
      }
    `,
    dimensionsRef
  )
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()

  const addDimension = () => {
    if (submitting) return
    submitMutation()
    const lastSortOrder = dimensions.at(-1)?.sortOrder ?? ''
    const sortOrder = positionAfter(lastSortOrder)
    const dimensionCount = dimensions.length
    AddPokerTemplateDimensionMutation(
      atmosphere,
      {templateId},
      {
        dimensionCount,
        sortOrder,
        onError,
        onCompleted
      }
    )
  }

  if (dimensions.length >= Threshold.MAX_REFLECTION_PROMPTS) return null
  return (
    <Button
      size='default'
      onClick={addDimension}
      disabled={submitting}
      className='m-0 mb-4 flex items-center justify-start bg-transparent p-0 px-0 py-1 text-[14px] text-base text-sky-500 leading-5 shadow-none outline-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
    >
      <Add className='mx-4 block' />
      <div>Add another dimension</div>
    </Button>
  )
}

export default AddPokerTemplateDimension
