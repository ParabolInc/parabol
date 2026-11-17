import {Link} from 'react-router'
import {commitLocalUpdate} from 'relay-runtime'
import type Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props {
  name: string
  message: string
  isTeamFilterSelected?: boolean
}
const MeetingsDashEmpty = (props: Props) => {
  const clearDashSearch = (atmosphere: Atmosphere) => {
    commitLocalUpdate(atmosphere, (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!viewer) return
      viewer.setValue(null, 'dashSearch')
    })
  }

  const atmosphere = useAtmosphere()
  const onClick = () => {
    clearDashSearch(atmosphere)
  }

  const {name, message, isTeamFilterSelected} = props
  return (
    <div className='m-2 p-0'>
      <h1 className='m-0 mb-4 p-0 text-[24px]'>{`Hi ${name},`}</h1>
      <p className='m-0 p-0 fuzzy-tablet:text-base text-sm fuzzy-tablet:leading-6 leading-5'>
        {message}
        {isTeamFilterSelected ? (
          <>
            <Link
              to={'/meetings'}
              className='font-sans font-semibold text-accent no-underline'
              onClick={onClick}
            >
              {' Click here'}
            </Link>
            {'  to see meetings on all of your teams.'}
          </>
        ) : null}
      </p>
    </div>
  )
}

export default MeetingsDashEmpty
