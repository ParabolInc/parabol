// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login: typeof login
    }
    type cy = any
  }
}

import makeAuthTokenObj from '../../src/server/utils/makeAuthTokenObj'
import encodeAuthTokenObj from '../../src/server/utils/encodeAuthTokenObj'
import {APP_TOKEN_KEY} from '../../src/universal/utils/constants'

const login = (overrides = {}) => {
  Cypress.log({
    name: 'login'
  })
  const authToken = encodeAuthTokenObj(
    makeAuthTokenObj({sub: 'auth0|5c75e3a068d77f71b39513a9', tms: []})
  )
  window.localStorage.setItem(APP_TOKEN_KEY, authToken)
  cy.visit('/')
  cy.location('pathname').should('eq', '/me')
}

Cypress.Commands.add('login', login)
