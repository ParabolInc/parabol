import {useNavigate} from 'react-router'
import {Button} from '../ui/Button/Button'
import hasToken from '../utils/hasToken'

const DemoCreateAccountPrimaryButton = () => {
  const navigate = useNavigate()
  const path = hasToken() ? '/meetings' : '/create-account?from=demo'
  const label = hasToken() ? 'My Dashboard' : 'Create Free Account'
  const handleClick = () => navigate(path)
  return (
    <Button variant='primary' onClick={handleClick} size='md'>
      {label}
    </Button>
  )
}

export default DemoCreateAccountPrimaryButton
