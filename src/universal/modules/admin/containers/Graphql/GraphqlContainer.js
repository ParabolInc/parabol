import GraphiQL from 'graphiql'
import React, {Component} from 'react'
import requireAuthAndRole from 'universal/decorators/requireAuthAndRole/requireAuthAndRole'
import styled from 'react-emotion'
import 'graphiql/graphiql.css'

const GQL = styled('div')({
  margin: 0,
  height: '100vh',
  minHeight: '100vh',
  padding: 0,
  width: '100%'
})

class Graphiql extends Component {
  fetcher = async ({query, variables}) => {
    return this.props.atmosphere.handleFetch({text: query}, variables)
  }

  render () {
    return (
      <GQL>
        <GraphiQL fetcher={this.fetcher} />
      </GQL>
    )
  }
}

export default requireAuthAndRole({role: 'su'})(Graphiql)
