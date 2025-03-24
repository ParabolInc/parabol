import ConfigureNotificationsModal from './ConfigureNotificationsModal'
import CreateTaskModalRoot from './CreateTaskModal'
import InviteToMeetingModalRoot from './InviteToMeetingModal'
import InviteToTeamModalRoot from './InviteToTeamModal'
import LinkTeamModal from './LinkTeamModal'
import PushReflectionModalRoot from './PushReflection'
import StartActivityModalRoot from './StartActivityModal'

const ModalRoot = () => {
  return (
    <>
      <CreateTaskModalRoot />
      <InviteToTeamModalRoot />
      <InviteToMeetingModalRoot />
      <LinkTeamModal />
      <PushReflectionModalRoot />
      <StartActivityModalRoot />
      <ConfigureNotificationsModal />
    </>
  )
}

export default ModalRoot
