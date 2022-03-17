import React from 'react'
import ToggleNav from '../../../../components/ToggleNav/ToggleNav'
import useRouter from '../../../../hooks/useRouter'

interface Props {
  activeKey: string
  teamId: string
}

const TeamSettingsToggleNav = (props: Props) => {
  const {activeKey, teamId} = props
  const {history} = useRouter()
  const makeOnClick = (area = '') => {
    return area === activeKey
      ? undefined
      : () => {
          history.push(`/team/${teamId}/settings/${area}`)
        }
  }

  const items = [
    {
      label: 'Team',
      icon: 'group',
      isActive: activeKey === '',
      onClick: makeOnClick()
    },
    {
      label: 'Integrations',
      icon: 'extension',
      isActive: activeKey === 'integrations',
      onClick: makeOnClick('integrations')
    }
  ]

  const wrapperStyle = {
    margin: '16px auto 0',
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
