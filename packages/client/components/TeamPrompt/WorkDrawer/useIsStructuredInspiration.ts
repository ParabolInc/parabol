import {useWorkDrawerConsume} from './WorkDrawerConsumeContext'

const useIsStructuredInspiration = () => useWorkDrawerConsume().mode === 'teamPrompt'

export default useIsStructuredInspiration
