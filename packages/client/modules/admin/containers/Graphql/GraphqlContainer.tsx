import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'
import React, {useRef, useState} from 'react'
import styled from '@emotion/styled'
import logoMarkPrimary from '../../../../styles/theme/images/brand/parabol-lockup-h-dark.svg'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useAuthRoute from '../../../../hooks/useAuthRoute'
import {AuthTokenRole, LocalStorageKey} from '../../../../types/constEnums'

const GQL = styled('div')({
  margin: 0,
  height: '100vh',
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

type SchemaType = 'Public' | 'Private'

const GraphqlContainer = () => {
  const [currentSchema, setCurrentSchema] = useState<SchemaType>(() => {
    return (window.localStorage.getItem(LocalStorageKey.GRAPHIQL_SCHEMA) as SchemaType) || 'Public'
  })

  const graphiql = useRef<GraphiQL>()
  const atmosphere = useAtmosphere()
  useAuthRoute({role: AuthTokenRole.SUPER_USER})
  const changeSchema = (value: SchemaType) => {
    setCurrentSchema(value)
    window.localStorage.setItem(LocalStorageKey.GRAPHIQL_SCHEMA, value)
  }
  const fetcher = async ({query, variables}) => {
    const url = `${window.location.origin}/intranet-graphql`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${atmosphere.authToken}`
      },
      body: JSON.stringify({query, variables, isPrivate: currentSchema === 'Private'})
    })
    return res.json()
  }

  return (
    <GQL>
      <GraphiQL fetcher={fetcher} ref={graphiql}>
        <GraphiQL.Logo>
          <img crossOrigin='' alt='Parabol' src={logoMarkPrimary} />
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
            <GraphiQL.Select title='Schema' label='Schema' onSelect={changeSchema}>
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
