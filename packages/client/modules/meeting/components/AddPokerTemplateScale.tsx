import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import {Threshold} from '~/types/constEnums'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import {MenuProps} from '../../../hooks/useMenu'
import AddPokerTemplateScaleMutation from '../../../mutations/AddPokerTemplateScaleMutation'
import {FONT_FAMILY} from '../../../styles/typographyV2'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {AddPokerTemplateScale_scales} from '../../../__generated__/AddPokerTemplateScale_scales.graphql'

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

interface Props extends WithAtmosphereProps, WithMutationProps {
  scales: AddPokerTemplateScale_scales
  teamId: string
  menuProps: MenuProps
}

class AddTemplateScale extends Component<Props> {
  addScale = () => {
    const {
      atmosphere,
      teamId,
      menuProps,
      onError,
      onCompleted,
      submitMutation,
      submitting
    } = this.props
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

  render() {
    const {scales, submitting} = this.props
    if (scales.length >= Threshold.MAX_REFLECTION_PROMPTS) return null
    return (
      <AddScaleLink palette='blue' onClick={this.addScale} waiting={submitting}>
        <AddScaleLinkPlus>add</AddScaleLinkPlus>
        <div>Create a Scale</div>
      </AddScaleLink>
    )
  }
}

export default createFragmentContainer(withMutationProps(withAtmosphere(AddTemplateScale)), {
  scales: graphql`
    fragment AddPokerTemplateScale_scales on TemplateScale @relay(plural: true) {
      id
    }
  `
})
