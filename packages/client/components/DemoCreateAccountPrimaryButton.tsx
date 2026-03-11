import {useNavigate} from 'react-router-dom'
import hasToken from '../utils/hasToken'
import PrimaryButton from './PrimaryButton'

const DemoCreateAccountPrimaryButton = () => {
  const navigate = useNavigate()
  const path = hasToken() ? '/meetings' : '/create-account?from=demo'
  const label = hasToken() ? 'My Dashboard' : 'Create Free Account'
  const handleClick = () => navigate(path)
  return (
    <PrimaryButton onClick={handleClick} size='medium'>
      {label}
    </PrimaryButton>
  )
}

export default DemoCreateAccountPrimaryButton
