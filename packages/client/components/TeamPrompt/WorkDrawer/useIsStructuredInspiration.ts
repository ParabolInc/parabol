import getStructuredInspiration from './getStructuredInspiration'
import {useWorkDrawerConsume} from './WorkDrawerConsumeContext'

const useIsStructuredInspiration = () => !!getStructuredInspiration(useWorkDrawerConsume())

export default useIsStructuredInspiration
