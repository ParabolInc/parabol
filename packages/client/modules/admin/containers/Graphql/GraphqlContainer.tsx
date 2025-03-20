import {type Fetcher, type FetcherParams} from '@graphiql/toolkit'
import GraphiQL from 'graphiql/dist'
import 'graphiql/graphiql.css'
import {meros} from 'meros'
import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import logoMarkPrimary from '../../../../styles/theme/images/brand/lockup_color_mark_dark_type.svg'
import logoMarkDark from '../../../../styles/theme/images/brand/lockup_color_mark_white_type.svg'

import {AuthTokenRole} from '../../../../types/constEnums'

export function createGraphiQLFetcher(options: CreateFetcherOptions): Fetcher {
  const httpFetch = options.fetch || (typeof window !== 'undefined' && window.fetch)
  if (!httpFetch) {
    throw new Error('No valid fetcher implementation available')
  }
  options.enableIncrementalDelivery = options.enableIncrementalDelivery !== false
  // simpler fetcher for schema requests
  const simpleFetcher = createSimpleFetcher(options, httpFetch)

  const httpFetcher = options.enableIncrementalDelivery
    ? createMultipartFetcher(options, httpFetch)
    : simpleFetcher

  return async (graphQLParams, fetcherOpts) => {
    if (graphQLParams.operationName === 'IntrospectionQuery') {
      return (options.schemaFetcher || simpleFetcher)(graphQLParams, fetcherOpts)
    }
    const isSubscription = fetcherOpts?.documentAST
      ? isSubscriptionWithName(fetcherOpts.documentAST, graphQLParams.operationName || undefined)
      : false

    return httpFetcher(graphQLParams, fetcherOpts)
  }
}

export function isAsyncIterable(input: unknown): input is AsyncIterable<unknown> {
  return (
    typeof input === 'object' &&
    input !== null &&
    // Some browsers still don't have Symbol.asyncIterator implemented (iOS Safari)
    // That means every custom AsyncIterable must be built using a AsyncGeneratorFunction (async function * () {})
    ((input as any)[Symbol.toStringTag] === 'AsyncGenerator' || Symbol.asyncIterator in input)
  )
}

const GraphqlContainer = () => {
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.SUPER_USER})
  const fetcher: Fetcher = async function* ({query, variables, operationName}: FetcherParams) {
    if (operationName === 'IntrospectionQuery') {
      const simpleResponse = await fetch('/intranet-graphql', {
        method: 'POST',
        body: JSON.stringify({query, variables, isPrivate: true}),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          'x-application-authorization': `Bearer ${atmosphere.authToken}`
        }
      })
      return await simpleResponse.json()
    }
    const rawResponse = await fetch('/intranet-graphql', {
      method: 'POST',
      body: JSON.stringify({query, variables, operationName, isPrivate: true}),
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, multipart/mixed; boundary="-"',
        'x-application-authorization': `Bearer ${atmosphere.authToken}`
      }
    })
    const response = await meros(rawResponse, {multiple: true})

    // Follows the same as createSimpleFetcher above, in that we simply return it as json.
    if (!isAsyncIterable(response)) {
      console.log('res not async')
      return yield response.json()
    }
    // console.log('res is async', response)
    for await (const chunk of response) {
      console.log('got async chunk', chunk)
      if (chunk.some((part) => !part.json)) {
        const message = chunk.map((part) => `Headers::\n${part.headers}\n\nBody::\n${part.body}`)
        throw new Error(`Expected multipart chunks to be of json type. got:\n${message}`)
      }
      yield chunk.map((part) => part.body)
    }
  }

  const [isDarkMode, setIsDarkMode] = useState(false)
  useEffect(() => {
    // @graphiql/react only supports ESM so we can't import useTheme
    // This hack works, but it won't update until the component re-renders
    const setMode = localStorage.getItem('graphiql:theme')
    const nextTheme =
      setMode === 'dark'
        ? true
        : setMode === 'light'
          ? false
          : window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(nextTheme)
  })

  const logo = isDarkMode ? logoMarkDark : logoMarkPrimary
  return (
    <GraphiQL fetcher={fetcher}>
      <GraphiQL.Logo>
        <Link to={'/'}>
          <img crossOrigin='' alt='Parabol' src={logo} className={'flex'} />
        </Link>
      </GraphiQL.Logo>
    </GraphiQL>
  )
}

export default GraphqlContainer
