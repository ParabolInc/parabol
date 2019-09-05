import {useEffect} from 'react'
import {RouteComponentProps} from 'react-router'

interface Props extends RouteComponentProps<{token?: string}> {}

const SAMLRedirect = (props: Props) => {
  const {match} = props
  const {params} = match
  const {token} = params
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({code: token}, window.location.origin)
    }

  }, [])
  return null
}

export default SAMLRedirect
