import {useRelayEnvironment} from 'react-relay'
import type Atmosphere from '../Atmosphere'

const useAtmosphere = () => {
  return useRelayEnvironment() as Atmosphere
}

export default useAtmosphere
