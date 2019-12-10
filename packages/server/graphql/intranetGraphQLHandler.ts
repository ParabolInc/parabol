import AuthToken from '../database/types/AuthToken'
import express from 'express'
import executeGraphQL from './executeGraphQL'

const intranetHttpGraphQLHandler = async (req: express.Request, res: express.Response) => {
  const {query, variables, isPrivate} = req.body
  const authToken = (req as any).user || ({} as AuthToken)
  if (authToken.rol !== 'su') {
    res.status(401).send()
    return
  }
  const result = await executeGraphQL({
    authToken,
    ip: req.ip,
    query,
    variables,
    isPrivate,
    isAdHoc: true
  })
  res.send(result)
}

export default intranetHttpGraphQLHandler
