import CreateTaskModalRoot from './CreateTaskModal'
import InviteToTeamModalRoot from './InviteToTeamModal'
import LinkTeamModal from './LinkTeamModal'
import PushReflectionModalRoot from './PushReflection'
import StartActivityModalRoot from './StartActivityModal'

const ModalRoot = () => {
  return (
    <>
      <CreateTaskModalRoot />
      <InviteToTeamModalRoot />
      <LinkTeamModal />
      <PushReflectionModalRoot />
      <StartActivityModalRoot />
    </>
  )
}

export default ModalRoot
