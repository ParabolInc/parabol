import useClientSideTrack from '../../hooks/useClientSideTrack'
import {ExternalLinks} from '../../types/constEnums'
import {phaseLabelLookup} from '../../utils/meetings/lookups'
import HelpMenuContent from './HelpMenuContent'
import HelpMenuCopy from './HelpMenuCopy'
import HelpMenuHeader from './HelpMenuHeader'
import HelpMenuLink from './HelpMenuLink'

interface Props {
  onClose: () => void
}

const UpdatesHelpMenu = (props: Props) => {
  const {onClose} = props
  useClientSideTrack('Help Menu Open', {phase: 'updates'})
  return (
    <HelpMenuContent onClose={onClose}>
      <HelpMenuHeader>{phaseLabelLookup.updates}</HelpMenuHeader>
      <HelpMenuCopy>
        {
          'During this phase each teammate has uninterrupted airtime to give an update on their work.'
        }
      </HelpMenuCopy>
      <HelpMenuCopy>
        {
          'Help keep your team stay on schedule by adding Agenda topics to the queue if updates inspire the need for discussion.'
        }
      </HelpMenuCopy>
      <HelpMenuLink
        copy='Learn More'
        href={`${ExternalLinks.GETTING_STARTED_CHECK_INS}#solo-updates`}
      />
    </HelpMenuContent>
  )
}

export default UpdatesHelpMenu
