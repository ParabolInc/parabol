import styled from 'react-emotion'
import HelpMenuCopy from 'universal/components/MeetingHelp/HelpMenuCopy'

const DelayedCopy = styled(HelpMenuCopy)(({margin, show}: {show: boolean; margin: string}) => ({
  opacity: show ? 1 : 0,
  transition: `all 300ms`,
  margin
}))

export default DelayedCopy
