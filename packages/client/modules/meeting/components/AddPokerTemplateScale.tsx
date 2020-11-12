import styled from '@emotion/styled'
import React from 'react'
import {Threshold} from '~/types/constEnums'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import useMutationProps from '../../../hooks/useMutationProps'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import {FONT_FAMILY} from '../../../styles/typographyV2'

const AddScaleLink = styled(LinkButton)({
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontWeight: 600,
  fontsize: 16,
  lineHeight: '24px',
  padding: '16px 0px 16px 16px'
})

const AddScaleLinkPlus = styled(Icon)({
  display: 'block',
  margin: '0 16px 0 16px'
})

interface Props {
  scalesCount: number
  teamId: string
  menuProps: MenuProps
}

const AddPokerTemplateScale = (props: Props) => {
  const addScale = () => {
    const {
      teamId,
      menuProps
    } = props
    const atmosphere = useAtmosphere()
    const {onError, onCompleted, submitting, submitMutation} = useMutationProps()
    const {closePortal} = menuProps
    if (submitting) return
    submitMutation()
    AddPokerTemplateScaleMutation(
      atmosphere,
      {teamId},
      {
        onError,
        onCompleted
      }
    )
    closePortal()
  }

  const {scalesCount} = props
  const {submitting, } = useMutationProps()
  if (scalesCount >= Threshold.MAX_REFLECTION_PROMPTS) return null
  return (
    <AddScaleLink palette='blue' onClick={addScale} waiting={submitting}>
      <AddScaleLinkPlus>add</AddScaleLinkPlus>
      <div>Create a Scale</div>
    </AddScaleLink>
  )
}
export default AddPokerTemplateScale