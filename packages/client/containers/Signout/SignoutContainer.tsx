import {useEffect} from 'react'
import signout from './signout'
import {connect} from 'react-redux'
import useAtmosphere from '../../hooks/useAtmosphere'
import useRouter from '../../hooks/useRouter'

interface Props {
  dispatch: any
}

const SignoutContainer = (props: Props) => {
  const {dispatch} = props
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    signout(atmosphere, dispatch, history)
  }, [])
  return null
}

export default connect()(SignoutContainer)
