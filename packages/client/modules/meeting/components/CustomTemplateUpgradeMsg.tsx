import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'
import {useHistory} from 'react-router'
import customTemplate from '../../../../../static/images/illustrations/customTemplate.png'
import FloatingActionButton from '../../../components/FloatingActionButton'
import useAtmosphere from '../../../hooks/useAtmosphere'
import SendClientSegmentEventMutation from '../../../mutations/SendClientSegmentEventMutation'
import {BezierCurve} from '../../../types/constEnums'
import {MeetingTypeEnum} from '../../../__generated__/TeamInvitationQuery.graphql'

const fadein = keyframes`
0% { opacity: 0; }
100% { opacity: 1; }
`

const ButtonBlock = styled('div')({
  animation: `${fadein} 200ms ${BezierCurve.DECELERATE}`,
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
  width: '100%',
  zIndex: 1,
  height: '100%'
})

const Button = styled(FloatingActionButton)({
  border: 0,
  fontSize: 16,
  padding: '10px 24px',
  pointerEvents: 'all'
})

const Header = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px 0',
  width: '100%',
  textAlign: 'center',
  fontSize: 20,
  fontWeight: 600
})

const Details = styled('div')({
  display: 'flex',
  padding: '16px 48px',
  width: '100%',
  lineHeight: '24px',
  textAlign: 'center',
  fontSize: 16
})

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  maxWidth: 520,
  width: '100%'
})

const TemplateImage = styled('img')({
  margin: '0 auto',
  maxWidth: 360,
  maxHeight: 200,
  padding: '16px 0 0',
  width: '100%',
  objectFit: 'contain'
})

interface Props {
  orgId: string
  meetingType: MeetingTypeEnum
}

const CustomTempateUpgradeMsg = (props: Props) => {
  const {orgId, meetingType} = props
  const history = useHistory()
  const atmosphere = useAtmosphere()

  const handleClick = () => {
    SendClientSegmentEventMutation(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'createNewTemplate',
      meetingType
    })
    history.push(`/me/organizations/${orgId}/billing`)
  }

  return (
    <Container>
      <TemplateImage src={customTemplate} />
      <Header>{'Create Custom Templates'}</Header>
      <Details>
        {'Upgrade to create custom templates that you can share with your organization or team'}
      </Details>
      <ButtonBlock>
        <Button onClick={handleClick} palette='pink'>
          {'Upgrade Now'}
        </Button>
      </ButtonBlock>
    </Container>
  )
}

export default CustomTempateUpgradeMsg
