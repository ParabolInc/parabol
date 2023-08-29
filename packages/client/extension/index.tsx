import React from 'react'
import {render} from 'react-dom'
// import Root from './Root'
import '../scrollIntoViewIfNeeded'
import '../types/modules.d'
import App from './app'

window.__ACTION__ = {
  atlassian: 'P4yyaloNhbKxIXSHsRai4S9W7uu0RM6a',
  datadogClientToken: 'pubd4283422eb64210f2207697dddaaf092',
  datadogApplicationId: 'f31fc02e-557c-46b2-9b8f-6711bc065720',
  datadogService: 'parabol-local-dev',
  github: 'aee680b3bdca28f82d8d',
  google: '891775917048-p0pgj0i83sbkh9nnl7hlhquv4up0hm8c.apps.googleusercontent.com',
  googleAnalytics: 'G-HJYW8K1HQW',
  slack: '8530207108.1492591959815',
  stripe: 'pk_test_MNoKbCzQX0lhktuxxI7M14wd',
  oauth2Redirect: 'https://oauth2redirect.parabol.co',
  prblIn: 'localhost:3000/invitation-link',
  AUTH_INTERNAL_ENABLED: true,
  AUTH_GOOGLE_ENABLED: true,
  AUTH_SSO_ENABLED: true
}

render(<App />, document.getElementById('root'))
