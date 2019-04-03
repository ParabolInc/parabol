import React from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import JiraConfigMenu from 'universal/components/JiraConfigMenu'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import PlainButton from 'universal/components/PlainButton/PlainButton'
import {PALETTE} from 'universal/styles/paletteV2'
import jiraLogo from 'universal/styles/theme/images/graphics/jira.svg'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import useAtlassianSites from 'universal/hooks/useAtlassianSites'
import LoadableMenu from 'universal/components/LoadableMenu'

const JiraLogo = styled('img')({
  width: 48,
  height: 48,
  marginRight: 16
})

const TitleBlock = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})

const Title = styled('div')({
  color: PALETTE.TEXT.MAIN,
  fontSize: 24
})

const Subtitle = styled('div')({
  color: PALETTE.TEXT.LIGHT,
  fontSize: 14,
  lineHeight: '18px'
})

const Header = styled('div')({
  display: 'flex',
  padding: 16,
  position: 'relative'
})

const SiteList = styled('div')({
  paddingRight: 16
})

const SiteAvatar = styled('img')({
  borderRadius: '100%'
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

interface Props {
  accessToken?: string
  teamId: string
}

const MenuButton = styled(PlainButton)({
  color: PALETTE.PRIMARY.MAIN,
  position: 'absolute',
  fontSize: ICON_SIZE.MD18,
  top: 16,
  right: 16,
  userSelect: 'none',
  height: 24
})

const JiraIntegrationHeader = (props: Props) => {
  const {accessToken, teamId} = props
  const {sites, status} = useAtlassianSites(accessToken)
  console.log('sites', sites, status, teamId)
  return (
    <Header>
      <JiraLogo src={jiraLogo} />
      <TitleBlock>
        <Title>Jira</Title>
        <Subtitle>Create issues from Parabol</Subtitle>
      </TitleBlock>
      <SiteList>
        <LoadingComponent spinnerSize={24} height={24} />
        {/*{status === 'loaded' &&*/}
        {/*  sites.map((site) => (*/}
        {/*    <SiteAvatar width={24} height={24} src={site.avatarUrl} title={site.name} />*/}
        {/*  ))}*/}
        {/*{status === 'loading' && <LoadingComponent />}*/}
      </SiteList>
      <LoadableMenu
        LoadableComponent={JiraConfigMenu}
        maxWidth={400}
        maxHeight={225}
        originAnchor={originAnchor}
        queryVars={{teamId}}
        targetAnchor={targetAnchor}
        toggle={
          <MenuButton>
            <Icon>more_vert</Icon>
          </MenuButton>
        }
      />
    </Header>
  )
}

export default JiraIntegrationHeader
