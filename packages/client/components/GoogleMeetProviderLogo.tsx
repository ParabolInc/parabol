import logo from '../styles/theme/images/graphics/google-meet-icon.svg'

const GoogleMeetProviderLogo = () => {
  return (
    <div
      className='h-6 w-6 bg-contain bg-no-repeat'
      style={{backgroundImage: `url(${logo})`}}
    ></div>
  )
}

export default GoogleMeetProviderLogo
