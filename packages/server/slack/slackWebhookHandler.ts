import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import publishWebhookGQL from '../utils/publishWebhookGQL'
import {getStripeManager} from '../utils/stripe'

const slackWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const parser = (buffer: Buffer) => buffer.toString()
  const str = (await parseBody({res, parser})) as string | null

  if (!str) {
    res.writeStatus('400').end()
    return
  }
  const message = JSON.parse(str)

  console.log('GEORG req', req, str)
  const {type} = message

  switch (type) {
    case 'url_verification':
      const {challenge} = message
      res.write(JSON.stringify({challenge}))
      res.writeStatus('200').end()
      return
  }
      
  res.writeStatus('404').end()
})

export default slackWebhookHandler
