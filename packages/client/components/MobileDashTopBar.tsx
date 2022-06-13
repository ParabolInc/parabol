import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {AppBar} from '~/types/constEnums'
import {MobileDashTopBar_query$key} from '../__generated__/MobileDashTopBar_query.graphql'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import TopBarHelp from './TopBarHelp'
import TopBarIcon from './TopBarIcon'
import TopBarNotifications from './TopBarNotifications'

interface Props {
  toggle: () => void
  viewerRef: MobileDashTopBar_query$key
}

const Wrapper = styled('header')({
  backgroundColor: PALETTE.GRAPE_700,
  display: 'flex',
  height: AppBar.HEIGHT,
  maxWidth: '100%'
})

const LeftNavToggle = styled(PlainButton)({
  fontSize: ICON_SIZE.MD24,
  lineHeight: '16px',
  paddingLeft: 16
})

const LeftNavHeader = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_200,
  display: 'flex',
  flex: 1,
  minWidth: 0
})

const TopBarIcons = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_200,
  display: 'flex',
  justifyContent: 'flex-end',
  maxWidth: 560,
  paddingRight: 16
})

const Title = styled('div')({
  fontSize: 20,
  overflow: 'hidden',
  paddingLeft: 16,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const MobileDashTopBar = (props: Props) => {
  const {toggle, viewerRef} = props
  const data = useFragment(
    graphql`
      fragment MobileDashTopBar_query on Query {
        ...TopBarNotifications_query
        viewer {
          pageName
        }
      }
    `,
    viewerRef
  )
  const {viewer} = data
  const pageName = viewer?.pageName ?? 'Parabol'
  return (
    <Wrapper>
      <LeftNavHeader>
        <LeftNavToggle onClick={toggle}>
          <Icon>{'menu'}</Icon>
        </LeftNavToggle>
        <Title>{pageName}</Title>
      </LeftNavHeader>
      <TopBarIcons>
        {/* Disable search in mobile for now */}
        {false && <TopBarIcon icon={'search'} ariaLabel={'Search'} />}
        <TopBarHelp />
        <TopBarNotifications queryRef={data || null} />
      </TopBarIcons>
    </Wrapper>
  )
}

export default MobileDashTopBar
