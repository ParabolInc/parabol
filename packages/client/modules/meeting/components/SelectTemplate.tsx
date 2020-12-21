import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import FloatingActionButton from '../../../components/FloatingActionButton'
import Icon from '../../../components/Icon'
import StyledError from '../../../components/StyledError'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import SelectTemplateMutation from '../../../mutations/SelectTemplateMutation'
import {SelectTemplate_template} from '../../../__generated__/SelectTemplate_template.graphql'

const ButtonBlock = styled('div')({
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '8px 16px 16px 8px',
  pointerEvents: 'none',
  right: 0,
  bottom: 0,
  width: '100%'
})

const Button = styled(FloatingActionButton)({
  border: 0,
  fontSize: 16,
  padding: '8px 20px',
  pointerEvents: 'all'
})

const StyledIcon = styled(Icon)({
  marginRight: 4
})

interface Props {
  closePortal: () => void
  template: SelectTemplate_template
  teamId: string
}

const SelectTemplate = (props: Props) => {
  const {template, closePortal, teamId} = props
  const {id: templateId} = template
  const atmosphere = useAtmosphere()
  const {submitting, error} = useMutationProps()
  const selectTemplate = () => {
    SelectTemplateMutation(atmosphere, {selectedTemplateId: templateId, teamId})
    closePortal()
  }
  return (
    <ButtonBlock>
      {error && <StyledError>{error.message}</StyledError>}
      <Button onClick={selectTemplate} palette='blue' waiting={submitting}>
        <StyledIcon>check</StyledIcon>
        {'Use Template'}
      </Button>
    </ButtonBlock>
  )
}

export default createFragmentContainer(SelectTemplate, {
  template: graphql`
    fragment SelectTemplate_template on MeetingTemplate {
      id
      teamId
    }
  `
})