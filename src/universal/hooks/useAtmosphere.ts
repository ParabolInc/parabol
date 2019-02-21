import {useContext} from 'react'
import {AtmosphereContext} from 'universal/components/AtmosphereProvider/AtmosphereProvider'

const useAtmosphere = () => {
  return useContext(AtmosphereContext)
}

export default useAtmosphere
