import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'
import React, {useRef, useState} from 'react'
import styled from 'react-emotion'
import logoMarkPrimary from 'universal/styles/theme/images/brand/parabol-lockup-h-dark.svg'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useAuthRoute from 'universal/hooks/useAuthRoute'
import {AuthTokenRole} from 'universal/types/graphql'

const GQL = styled('div')({
  margin: 0,
  height: '100vh',
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

type SchemaType = 'Public' | 'Private'

const GraphqlContainer = () => {
  const [currentSchema, setCurrentSchema] = useState<SchemaType>('Public')
  const graphiql = useRef<GraphiQL>()
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.su})

  const publicFetcher = async ({query, variables}) => {
    return atmosphere.handleFetch({text: query} as any, variables, {})
  }

  const privateFetcher = async ({query, variables}) => {
    const res = await fetch(`${window.location.origin}/intranet-graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${atmosphere.authToken}`
      },
      body: JSON.stringify({query, variables})
    })
    return res.json()
  }

  const fetcher = currentSchema === 'Public' ? publicFetcher : privateFetcher

  return (
    <GQL>
      <GraphiQL fetcher={fetcher} ref={graphiql}>
        <GraphiQL.Logo>
          <img alt='Parabol' src={logoMarkPrimary} />
        </GraphiQL.Logo>
        <GraphiQL.Toolbar>
          <GraphiQL.ToolbarButton
            onClick={() => graphiql.current.handlePrettifyQuery()}
            title='Prettify Query (Shift-Ctrl-P)'
            label='Prettify'
          />
          <GraphiQL.ToolbarButton
            onClick={() => graphiql.current.handleToggleHistory()}
            title='Show History'
            label='History'
          />
          <GraphiQL.Group>
            <span>Schema: </span>
            <GraphiQL.Select title='Schema' label='Schema' onSelect={setCurrentSchema}>
              <GraphiQL.SelectOption
                label='Public'
                value='Public'
                selected={currentSchema === 'Public'}
              />
              <GraphiQL.SelectOption
                label='Private'
                value='Private'
                selected={currentSchema === 'Private'}
              />
            </GraphiQL.Select>
          </GraphiQL.Group>
        </GraphiQL.Toolbar>
      </GraphiQL>
    </GQL>
  )
}

export default GraphqlContainer
