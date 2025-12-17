import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useMutation} from 'react-relay'
import {useHistory, useLocation} from 'react-router'
import {OAuthAuthorizePageMutation} from '../__generated__/OAuthAuthorizePageMutation.graphql'
import {LoaderSize} from '../types/constEnums'
import LoadingComponent from './LoadingComponent/LoadingComponent'

const OAuthAuthorizePage = () => {
  const history = useHistory()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  const [commitCreateCode] = useMutation<OAuthAuthorizePageMutation>(graphql`
    mutation OAuthAuthorizePageMutation($input: CreateOAuthAPICodeInput!) {
      createOAuthAPICode(input: $input) {
        code
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
      onCompleted: (data) => {
        const {code, state} = data.createOAuthAPICode
        const redirectUrl = new URL(redirectUri)
        redirectUrl.searchParams.set('code', code)
        if (state) {
          redirectUrl.searchParams.set('state', state)
        }
        window.location.href = redirectUrl.toString()
      },
      onError: (err: Error) => {
        let errorMessage = err.message || 'Authorization failed'

        const code =
          (err as any).extensions?.code || (err as any).source?.errors?.[0]?.extensions?.code

        if (code === 'UNAUTHORIZED') {
          const currentUrl = location.pathname + location.search
          history.push(`/login?redirectTo=${encodeURIComponent(currentUrl)}`)
          return
        }

        errorMessage = errorMessage.replace(/^OAuth Error:\s*/i, '').replace(/^Error:\s*/i, '')

        setError(errorMessage)
      }
    })
  }, [location.search, location.pathname, commitCreateCode, history])

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
