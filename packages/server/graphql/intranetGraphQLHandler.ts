import privateGraphQLEndpoint from './privateGraphQLEndpoint'

const intranetHttpGraphQLHandler = async (req, res) => {
  const {query, variables} = req.body
  const authToken = (req as any).user || {}
  const result = await privateGraphQLEndpoint(query, variables, authToken)
  res.send(result)
}

export default intranetHttpGraphQLHandler
