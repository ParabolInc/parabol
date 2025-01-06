import CreateTaskModalRoot from './CreateTaskModal'
import LinkTeamModal from './LinkTeamModal'
import PushReflectionModalRoot from './PushReflection'
import StartActivityModalRoot from './StartActivityModal'

const ModalRoot = () => {
  return (
    <>
      <StartActivityModalRoot />
      <LinkTeamModal />
      <PushReflectionModalRoot />
      <CreateTaskModalRoot />
    </>
  )
}

export default ModalRoot
