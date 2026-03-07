import {useHistory} from 'react-router'
import hasToken from '../utils/hasToken'
import PrimaryButton from './PrimaryButton'

const DemoCreateAccountPrimaryButton = () => {
  const history = useHistory()
  const path = hasToken() ? '/meetings' : '/create-account?from=demo'
  const label = hasToken() ? 'My Dashboard' : 'Create Free Account'
  const handleClick = () => history.push(path)
  return (
    <PrimaryButton onClick={handleClick} size='medium'>
      {label}
    </PrimaryButton>
  )
}

export default DemoCreateAccountPrimaryButton
