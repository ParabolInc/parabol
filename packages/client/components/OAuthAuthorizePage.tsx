import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useMutation} from 'react-relay'
import {useHistory, useLocation} from 'react-router'
import {LoaderSize} from '../types/constEnums'
import LoadingComponent from './LoadingComponent/LoadingComponent'

const OAuthAuthorizePage = () => {
  const history = useHistory()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  const [commitCreateCode] = useMutation(graphql`
    mutation OAuthAuthorizePageMutation($input: CreateOAuthAPICodeInput!) {
      createOAuthAPICode(input: $input) {
        code
        redirectUri
        state
      }
    }
  `)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const clientId = params.get('client_id')
    const redirectUri = params.get('redirect_uri')
    const responseType = params.get('response_type')
    const scope = params.get('scope')
    const state = params.get('state')

    if (!clientId || !redirectUri || responseType !== 'code') {
      setError('Invalid request parameters')
      return
    }

    const scopes = scope ? scope.split(' ') : []

    commitCreateCode({
      variables: {
        input: {
          clientId,
          redirectUri,
          scopes,
          state: state || undefined
        }
      },
      onCompleted: (data: any) => {
        const {code, redirectUri, state} = data.createOAuthAPICode
        const redirectUrl = new URL(redirectUri)
        redirectUrl.searchParams.set('code', code)
        if (state) {
          redirectUrl.searchParams.set('state', state)
        }
        window.location.href = redirectUrl.toString()
      },
      onError: (err: any) => {
        setError(err.message || 'Authorization failed')
      }
    })
  }, [location.search, commitCreateCode])

  if (error) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='rounded-lg bg-white p-8 shadow-lg'>
          <h1 className='mb-4 font-bold text-2xl text-red-600'>Authorization Error</h1>
          <p className='text-slate-700'>{error}</p>
          <button
            onClick={() => history.push('/')}
            className='mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return <LoadingComponent spinnerSize={LoaderSize.WHOLE_PAGE} />
}

export default OAuthAuthorizePage
