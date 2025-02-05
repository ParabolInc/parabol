import CreateTaskModalRoot from './CreateTaskModal'
import InviteToMeetingModalRoot from './InviteToMeetingModal'
import InviteToTeamModalRoot from './InviteToTeamModal'
import LinkTeamModal from './LinkTeamModal'
import PushReflectionModalRoot from './PushReflection'
import StartActivityModalRoot from './StartActivityModal'
import "../index.css"

const ModalRoot = () => {
  return (
    <>
      <CreateTaskModalRoot />
      <InviteToTeamModalRoot />
      <InviteToMeetingModalRoot />
      <LinkTeamModal />
      <PushReflectionModalRoot />
      <StartActivityModalRoot />
    </>
  )
}

export default ModalRoot
