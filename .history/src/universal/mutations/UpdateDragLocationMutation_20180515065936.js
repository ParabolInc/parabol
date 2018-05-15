const mutation = graphql`
  mutation UpdateDragLocationMutation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`

const UpdateDragLocationMutation = (atmosphere, input) => {
  const {_network: network} = atmosphere
  network.execute(mutation(), {input}, {force: true})
}

export default UpdateDragLocationMutation
