import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import querystring from 'querystring'
import publishWebhookGQL from '../utils/publishWebhookGQL'
import SCIMMY from 'scimmy'

const ROUTE_PREFIX = '/scim'
const PROTO = process.env.PROTO
const HOST = process.env.HOST
const PORT = Number(__PRODUCTION__ ? process.env.PORT : process.env.SOCKET_PORT)

const ROUTE = `${PROTO}://${HOST}${ROUTE_PREFIX}`

const createUser = `
mutation ScimCreateUser($email: ID!, $preferredName: String!) {
  scimCreateUser(email: $email, preferredName: $preferredName) {
    ... on ErrorPayload {
      error {
        message
      }
    }
    ...on ScimCreateUserSuccess {
      user {
        id
        email
      }
    }
  }
}
`

const getUser = `
query User($userId: ID!) {
  user(userId: $userId) {
    id
    email
  }
}
`

// With both shorthand and full syntax
SCIMMY.Config.set({
   //documentationUri: "https://example.com/docs/scim.html",
   patch: false,
   filter: false,
   bulk: false,/*{
       supported: true,
       maxPayloadSize: 2097152
   },*/
   authenticationSchemes: {
     name: 'OAuth Bearer Token',
     description: 'Authentication scheme using the OAuth Bearer Token Standard',
     specUri: 'http://www.rfc-editor.org/info/rfc6750',
     type: 'oauthbearertoken'
   }
});

// Basic usage with provided resource type implementations
SCIMMY.Resources.declare(SCIMMY.Resources.User)
    .ingress(async (_resource, data) => {
      console.log('GEORG User ingress', data.id, data.userName)
      const { userName, displayName, emails } = data
      const email = (emails?.find((email) => email.primary) ?? emails?.[0])?.value
      console.log('GEORG User ingress', displayName, userName, email)

      const newUser = await publishWebhookGQL(createUser, {
        email,
        preferredName: displayName ?? userName
      })
      console.log('GEORG User ingress newUser', newUser)
      const {id, email: normalizedEmail} = (newUser as any).data.scimCreateUser.user
      return {
        id,
        userName: normalizedEmail
      }
    })
    .egress(async (_resource, userId) => {
      console.log('GEORG User egress', userId)
      const user = await publishWebhookGQL(getUser, {userId})
      console.log('GEORG User egress', user)
      const {id, email} = (user as any).data.user
      console.log('GEORG User egress', id, email)
      return {
        id,
        userName: email
      }
    })
    .degress((resource) => {
      console.log('GEORG User degress', resource)
    });

SCIMMY.Resources.Schema.basepath(ROUTE)
SCIMMY.Resources.ResourceType.basepath(ROUTE)
SCIMMY.Resources.ServiceProviderConfig.basepath(ROUTE)
for (let Resource of Object.values(SCIMMY.Resources.declared())) {
  Resource.basepath(ROUTE)
}

const SCIMHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const method = req.getMethod();
  const url = req.getUrl(); // Full URL path
  const query = req.getQuery();
  const parsedQuery = Object.fromEntries(new URLSearchParams(query).entries())

  console.log(`GEORG [${method}] ${url}`);

  if (url === "/scim/ServiceProviderConfig" && method === "get") {
    res.writeHeader("Content-Type", "application/json").end(JSON.stringify(await new SCIMMY.Resources.ServiceProviderConfig(req.getQuery()).read()));
    return
  }

  if (url.startsWith("/scim/ResourceTypes") && method === "get") {
    const idMatch = url.match(/^\/scim\/ResourceTypes\/(.+)$/);
    if (!idMatch) {
      try {
        const resourceTypes = await new SCIMMY.Resources.ResourceType(query).read()
        res.writeHeader("Content-Type", "application/scim+json").end(JSON.stringify(resourceTypes))
      } catch (err) {
        res.writeStatus("400 Bad Request").end(JSON.stringify({ error: String(err) }))
      }
    }
    else {
      const id = querystring.unescape(idMatch[1] ?? '');
      try {
        const resourceTypes = await new SCIMMY.Resources.ResourceType(id, parsedQuery).read()
        res.writeHeader("Content-Type", "application/scim+json").end(JSON.stringify(resourceTypes))
      } catch (err) {
        res.writeStatus("400 Bad Request").end(JSON.stringify({ error: String(err) }))
      }
    }
    return
  }

  if (url.startsWith("/scim/Schemas") && method === "get") {
    const idMatch = url.match(/^\/scim\/Schemas\/(.+)$/);
    if (!idMatch) {
      try {
        const resourceTypes = await new SCIMMY.Resources.Schema(query).read()
        res.writeHeader("Content-Type", "application/scim+json").end(JSON.stringify(resourceTypes))
      } catch (err) {
        res.writeStatus("400 Bad Request").end(JSON.stringify({ error: String(err) }))
      }
    }
    else {
      const id = querystring.unescape(idMatch[1] ?? '');
      try {
        const resourceTypes = await new SCIMMY.Resources.Schema(id, parsedQuery).read()
        res.writeHeader("Content-Type", "application/scim+json").end(JSON.stringify(resourceTypes))
      } catch (err) {
        res.writeStatus("400 Bad Request").end(JSON.stringify({ error: String(err) }))
      }
    }
    return
  }

  if (url.startsWith("/scim/Users")) {
    const idMatch = url.match(/^\/scim\/Users\/(.+)$/);
    if (!idMatch) {
      if (method === "get") {
        const users = await new SCIMMY.Resources.User(query).read();
        res.writeHeader("Content-Type", "application/scim+json").end(JSON.stringify(users));
        return
      }

      if (method === "post") {
        const body = await parseBody({res})
        if (body === null) {
          res.writeStatus("400 Bad Request")
          return
        }
        try {
          const user = await new SCIMMY.Resources.User(query).write(body)
          res.writeStatus("201 Created").writeHeader("Content-Type", "application/scim+json").end(JSON.stringify(user));
        } catch (err) {
          res.writeStatus("400 Bad Request").end(JSON.stringify({ error: String(err) }));
        }
        return
      }
    } else {
      const id = querystring.unescape(idMatch[1] ?? '');
      console.log('GEORG User id', id)

      if (method === "get") {
        try {
          const user = await new SCIMMY.Resources.User(query).read(id)
          res.writeHeader("Content-Type", "application/scim+json")
          res.end(JSON.stringify(user))
        } catch (err) {
          res.writeStatus("404 Not Found").end(JSON.stringify({ error: "User not found" }))
        }
        return
      }

      if (method === "patch") {
        const body = await parseBody({res})
        if (body === null) {
          res.writeStatus("400 Bad Request")
          return
        }
        try {
          const updatedUser = await new SCIMMY.Resources.User(id, parsedQuery).patch(body as any);
          res.writeHeader("Content-Type", "application/scim+json").end(JSON.stringify(updatedUser));
        } catch (err) {
          res.writeStatus("400 Bad Request").end(JSON.stringify({ error: String(err) }));
        }
        return
      }

      if (method === "delete") {
        try {
          await new SCIMMY.Resources.User(id).dispose();
          res.writeStatus("204 No Content").end();
        } catch (err) {
          res.writeStatus("404 Not Found").end(JSON.stringify({ error: "User not found" }));
        }
        return
      }
    }
  }

  res.writeStatus("404 Not Found").end(JSON.stringify({ error: "Endpoint not found" }));
  return
})

export default SCIMHandler
