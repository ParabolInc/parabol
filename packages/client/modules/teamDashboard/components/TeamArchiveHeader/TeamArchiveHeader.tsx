import styled from '@emotion/styled'
import {Archive} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'

const RootBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '16px 0',
  width: '100%'
})

const HeadingBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 32px 0 0',
  whiteSpace: 'nowrap'
})

const Heading = styled('div')({
  fontSize: 18,
  lineHeight: '32px'
})

const StyledIcon = styled(Archive)({
  color: PALETTE.SLATE_600,
  marginRight: 8
})

interface Props {
  teamId: string
}

const TeamArchiveHeader = (props: Props) => {
  const {teamId} = props

  const {t} = useTranslation()

  const {history} = useRouter()
  const goToTeamDash = () =>
    history.push(
      t('TeamArchiveHeader.TeamTeamId', {
        teamId
      })
    )
  return (
    <RootBlock>
      <HeadingBlock>
        <StyledIcon />
        <Heading>{t('TeamArchiveHeader.ArchivedTasks')}</Heading>
      </HeadingBlock>
      <DashNavControl
        icon='arrow_back'
        label={t('TeamArchiveHeader.BackToTeamTasks')}
        onClick={goToTeamDash}
      />
    </RootBlock>
  )
}

export default TeamArchiveHeader
