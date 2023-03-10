import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {Threshold} from '~/types/constEnums'
import LinkButton from '../../../components/LinkButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateDimensionMutation from '../../../mutations/AddPokerTemplateDimensionMutation'
import dndNoise from '../../../utils/dndNoise'
import {AddPokerTemplateDimension_dimensions$key} from '../../../__generated__/AddPokerTemplateDimension_dimensions.graphql'

const AddDimensionLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  marginBottom: 16,
  outline: 'none',
  padding: '4px 0'
})

const AddDimensionLinkPlus = styled(Add)({
  display: 'block',
  margin: '0 16px 0 16px'
})

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
    const sortOrders = dimensions.map(({sortOrder}) => sortOrder)
    const sortOrder = Math.max(0, ...sortOrders) + 1 + dndNoise()
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
    <AddDimensionLink palette='blue' onClick={addDimension} waiting={submitting}>
      <AddDimensionLinkPlus />
      <div>Add another dimension</div>
    </AddDimensionLink>
  )
}

export default AddPokerTemplateDimension
