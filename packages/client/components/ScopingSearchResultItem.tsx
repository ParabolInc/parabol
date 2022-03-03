import styled from '@emotion/styled'
import React from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
import {PALETTE} from '../styles/paletteV3'
import {Threshold} from '../types/constEnums'
import isTempId from '../utils/relay/isTempId'
import {UpdatePokerScopeMutationVariables} from '../__generated__/UpdatePokerScopeMutation.graphql'
import Checkbox from './Checkbox'
import Ellipsis from './Ellipsis/Ellipsis'

const Item = styled('div')({
  cursor: 'pointer',
  display: 'flex',
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8
})

const Issue = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

const Title = styled('div')({})

const StyledLink = styled('a')({
  color: PALETTE.SKY_500,
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

interface Props {
  meetingId: string
  usedServiceTaskIds: Set<string>
  persistQuery: () => void
  summary: string
  url: string
  linkTitle: string
  linkText: string
  serviceTaskId: string
  service: string
}

const ScopingSearchResultItem = (props: Props) => {
  const {
    meetingId,
    persistQuery,
    usedServiceTaskIds,
    summary,
    url,
    linkTitle,
    linkText,
    serviceTaskId,
    service
  } = props
  const isSelected = usedServiceTaskIds.has(serviceTaskId)
  const atmosphere = useAtmosphere()
  const {onCompleted, onError, submitMutation} = useMutationProps()
  const disabled = !isSelected && usedServiceTaskIds.size >= Threshold.MAX_POKER_STORIES
  const isTemp = isTempId(serviceTaskId)
  const onClick = () => {
    if (disabled || isTemp) return
    submitMutation()
    const variables = {
      meetingId,
      updates: [
        {
          service,
          serviceTaskId,
          action: isSelected ? 'DELETE' : 'ADD'
        }
      ]
    } as UpdatePokerScopeMutationVariables
    UpdatePokerScopeMutation(atmosphere, variables, {onError, onCompleted, contents: [summary]})
    if (!isSelected) {
      // if they are adding an item, then their search criteria must be good, so persist it
      persistQuery()
    }
  }

  return (
    <Item onClick={onClick}>
      <Checkbox active={isSelected || isTemp} disabled={disabled} />
      <Issue>
        <Title>{summary}</Title>
        <StyledLink href={url} rel='noopener noreferrer' target='_blank' title={linkTitle}>
          {linkText}
          {isTemp && <Ellipsis />}
        </StyledLink>
      </Issue>
    </Item>
  )
}

export default ScopingSearchResultItem
