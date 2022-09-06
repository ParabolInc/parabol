import styled from '@emotion/styled'
import {Close as CloseIcon, PersonAdd as PersonAddIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import useRouter from '~/hooks/useRouter'
import EndTeamPromptMutation from '~/mutations/EndTeamPromptMutation'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import getMassInvitationUrl from '../utils/getMassInvitationUrl'
import {MeetingCardOptionsMenuQuery} from '../__generated__/MeetingCardOptionsMenuQuery.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {MenuItemLabelStyle} from './MenuItemLabel'

interface Props {
  menuProps: MenuProps
  popTooltip: () => void
  queryRef: PreloadedQuery<MeetingCardOptionsMenuQuery>
}

const StyledIcon = styled('div')({
  color: PALETTE.SLATE_600,
  height: 24,
  width: 24,
  '& svg': {
    fontSize: 24
  },
  marginRight: 8
})

const OptionMenuItem = styled('div')({
  ...MenuItemLabelStyle,
  width: '200px'
})

const EndMeetingMutationLookup = {
  teamPrompt: EndTeamPromptMutation
}

const query = graphql`
  query MeetingCardOptionsMenuQuery($teamId: ID!, $meetingId: ID!) {
    viewer {
      team(teamId: $teamId) {
        massInvitation(meetingId: $meetingId) {
          id
        }
      }
      meeting(meetingId: $meetingId) {
        id
        meetingType
      }
    }
  }
`

const MeetingCardOptionsMenu = (props: Props) => {
  const {menuProps, popTooltip, queryRef} = props

  const {t} = useTranslation()

  const data = usePreloadedQuery<MeetingCardOptionsMenuQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {team, meeting} = viewer
  const {massInvitation} = team!
  const {id: token} = massInvitation
  const {id: meetingId, meetingType} = meeting!
  const canEndMeeting = meetingType === 'teamPrompt'
  const atmosphere = useAtmosphere()
  const {onCompleted, onError} = useMutationProps()
  const {history} = useRouter()

  const {closePortal} = menuProps
  return (
    <Menu ariaLabel={t('MeetingCardOptionsMenu.EditTheMeeting')} {...menuProps}>
      <MenuItem
        key='copy'
        label={
          <OptionMenuItem>
            <StyledIcon>
              <PersonAddIcon />
            </StyledIcon>
            <span>{t('MeetingCardOptionsMenu.CopyInviteLink')}</span>
          </OptionMenuItem>
        }
        onClick={async () => {
          popTooltip()
          closePortal()
          const copyUrl = getMassInvitationUrl(token)
          await navigator.clipboard.writeText(copyUrl)
        }}
      />
      {canEndMeeting && (
        <MenuItem
          key='close'
          label={
            <OptionMenuItem>
              <StyledIcon>
                <CloseIcon />
              </StyledIcon>
              <span>{t('MeetingCardOptionsMenu.EndTheMeeting')}</span>
            </OptionMenuItem>
          }
          onClick={() => {
            popTooltip()
            closePortal()
            EndMeetingMutationLookup[meetingType]?.(
              atmosphere,
              {meetingId},
              {onError, onCompleted, history}
            )
          }}
        />
      )}
    </Menu>
  )
}

export default MeetingCardOptionsMenu
