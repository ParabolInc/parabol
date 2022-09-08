import React from 'react'
import {useTranslation} from 'react-i18next'
import ToggleNav from '../../../../components/ToggleNav/ToggleNav'
import useRouter from '../../../../hooks/useRouter'

interface Props {
  activeKey: string
  teamId: string
}

const TeamSettingsToggleNav = (props: Props) => {
  const {activeKey, teamId} = props

  const {t} = useTranslation()

  const {history} = useRouter()
  const makeOnClick = (area = '') => {
    return area === activeKey
      ? undefined
      : () => {
          history.push(
            t('TeamSettingsToggleNav.TeamTeamIdSettingsArea', {
              teamId,
              area
            })
          )
        }
  }

  const items = [
    {
      label: t('TeamSettingsToggleNav.Team'),
      icon: 'group',
      isActive: activeKey === '',
      onClick: makeOnClick()
    },
    {
      label: t('TeamSettingsToggleNav.Integrations'),
      icon: 'extension',
      isActive: activeKey === 'integrations',
      onClick: makeOnClick('integrations')
    }
  ]

  const wrapperStyle = {
    margin: t('TeamSettingsToggleNav.16PxAuto0'),
    maxWidth: 768,
    width: '100%'
  }

  return (
    <div style={wrapperStyle}>
      <ToggleNav items={items} />
    </div>
  )
}

export default TeamSettingsToggleNav
