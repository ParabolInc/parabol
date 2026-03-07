import {useHistory} from 'react-router'
import ToggleNav from '../../../../components/ToggleNav/ToggleNav'

interface Props {
  activeKey: string
  teamId: string
}

const TeamSettingsToggleNav = (props: Props) => {
  const {activeKey, teamId} = props
  const history = useHistory()
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
      icon: 'group' as const,
      isActive: activeKey === '',
      onClick: makeOnClick()
    },
    {
      label: 'Integrations',
      icon: 'extension' as const,
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
