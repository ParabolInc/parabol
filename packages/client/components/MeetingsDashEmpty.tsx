import styled from '@emotion/styled'
import {Link} from 'react-router-dom'
import {commitLocalUpdate} from 'relay-runtime'
import {Breakpoint} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import Atmosphere from '../Atmosphere'
import useAtmosphere from '../hooks/useAtmosphere'

const maybeTabletPlusMediaQuery = makeMinWidthMediaQuery(Breakpoint.FUZZY_TABLET)

const Section = styled('div')({
  margin: 8,
  padding: 0
})

const Heading = styled('h1')({
  fontSize: 24,
  margin: '0 0 16px',
  padding: 0
})

const Copy = styled('p')({
  fontSize: 14,
  lineHeight: '20px',
  margin: 0,
  padding: 0,
  [maybeTabletPlusMediaQuery]: {
    fontSize: 16,
    lineHeight: '24px'
  }
})

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
    <Section>
      <Heading>{`Hi ${name},`}</Heading>
      <Copy>
        {message}
        {isTeamFilterSelected ? (
          <>
            <Link
              to={'/meetings'}
              className='font-sans font-semibold text-sky-500 no-underline'
              onClick={onClick}
            >
              {' Click here'}
            </Link>
            {'  to see meetings on all of your teams.'}
          </>
        ) : null}
      </Copy>
    </Section>
  )
}

export default MeetingsDashEmpty
