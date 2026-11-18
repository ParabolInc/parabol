import Atmosphere from '../Atmosphere'

// Made before React renders, so the router can start the first page's queries while the app is still mounting
const appAtmosphere = new Atmosphere()

export default appAtmosphere
