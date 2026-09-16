import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ReflectHelpMenu_settings$key} from '~/__generated__/ReflectHelpMenu_settings.graphql'
import useClientSideTrack from '../../hooks/useClientSideTrack'
import {ExternalLinks} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

interface Props {
  onClose: () => void
  meetingRef: ReflectHelpMenu_settings$key
}

const ReflectHelpMenu = (props: Props) => {
  const {onClose} = props
  const {meetingRef} = props
  const settings = useFragment(
    graphql`
      fragment ReflectHelpMenu_settings on RetrospectiveMeeting {
        id
        disableAnonymity
      }
    `,
    meetingRef
  )
  const disableAnonymity = settings.disableAnonymity
  useClientSideTrack('Help Menu Open', {phase: 'reflect'})
  return (
    <HelpMenuContent onClose={onClose}>
      <HelpMenuHeader>{phaseLabelLookup.reflect}</HelpMenuHeader>
      <HelpMenuCopy>The goal of this phase is to gather honest input from the team.</HelpMenuCopy>
      <HelpMenuCopy>
        As a group, reflect on how work’s going for a specific project or timeframe.
      </HelpMenuCopy>
      <HelpMenuCopy>
        During this phase nobody can see your reflections. After this phase reflections will be
        visible
        {!disableAnonymity && ', but remain anonymous'}.
      </HelpMenuCopy>
      <HelpMenuLink copy='Learn More' href={`${ExternalLinks.GETTING_STARTED_RETROS}#reflect`} />
    </HelpMenuContent>
  )
}

export default ReflectHelpMenu
