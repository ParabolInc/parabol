import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'
import React, {Component} from 'react'
import styled from 'react-emotion'
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import logoMarkPrimary from 'universal/styles/theme/images/brand/parabol-lockup-h-dark.svg'

const GQL = styled('div')({
  margin: 0,
  height: '100vh',
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

interface Props extends WithAtmosphereProps {}

interface State {
  currentSchema: 'Public' | 'Private'
}

class Graphiql extends Component<Props, State> {
  state: State = {
    currentSchema: 'Public'
  }

  graphiql = React.createRef<GraphiQL>()

  fetcher = async ({query, variables}) => {
    return this.props.atmosphere.handleFetch({text: query} as any, variables, {})
  }

  privateFetcher = async ({query, variables}) => {
    const {atmosphere} = this.props
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

  selectSchema = (value) => {
    this.setState({
      currentSchema: value
    })
  }

  render () {
    const {currentSchema} = this.state
    const fetcher = currentSchema === 'Public' ? this.fetcher : this.privateFetcher

    return (
      <GQL>
        <GraphiQL fetcher={fetcher} ref={this.graphiql}>
          <GraphiQL.Logo>
            <img alt='Parabol' src={logoMarkPrimary} />
          </GraphiQL.Logo>
          <GraphiQL.Toolbar>
            <GraphiQL.ToolbarButton
              onClick={() => this.graphiql.current.handlePrettifyQuery()}
              title='Prettify Query (Shift-Ctrl-P)'
              label='Prettify'
            />
            <GraphiQL.ToolbarButton
              onClick={() => this.graphiql.current.handleToggleHistory()}
              title='Show History'
              label='History'
            />
            <GraphiQL.Group>
              <span>Schema: </span>
              <GraphiQL.Select title='Schema' label='Schema' onSelect={this.selectSchema}>
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
}

export default withAtmosphere(requireAuthAndRole({role: 'su'})(Graphiql))
