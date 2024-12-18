import {useRelayEnvironment} from 'react-relay'
import {Atmosphere} from '../Atmosphere'

const useAtmosphere = () => {
  return useRelayEnvironment() as Atmosphere
}

export default useAtmosphere
