import jwtDecode from 'jwt-decode';
const auth0 = jest.genMockFromModule('auth0');

class AuthenticationClient {
  constructor() {
    this.__mockDB = null;
    this.tokens = {
      getInfo: jest.fn((auth0Token) => new Promise((resolve, reject) => {
        const authToken = jwtDecode(auth0Token);
        const match = this.__mockDB.user.find((user) => user.id === authToken.sub);
        if (match) {
          resolve(match);
        }
        reject(new Error(`auth0Client.tokens.getInfo (mock): unknown id ${authToken.sub}`));
      }))
    }
  }

  __initMock(db) {
    this.__mockDB = db;
  }
}

class ManagementClient {
  constructor() {
    this.__mockDB = null;
    this.users = {
      updateAppMetadata: jest.fn((identifierObj, updateObj) => new Promise((resolve, reject) => {
        const match = this.__mockDB.user.find((user) => user.id === identifierObj.id);
        if (!match) {
          return reject(new Error(`User ${identifierObj.id} not found in DB (did you create them yet?`));
        }
        if (Object.keys(identifierObj).length !== 1) {
          return reject(new Error(`identifierObj expects only the id field got ${JSON.stringify(identifierObj)}`));
        }
        if (Object.keys(updateObj).length !== 1) {
          return reject(new Error(`Only supply tms to auth0. Got ${JSON.stringify(updateObj)}`));
        }
        if (!Array.isArray(updateObj.tms)) {
          return reject(new Error(`That is not a valid tms to give to auth0, ${JSON.stringify(updateObj)}`));
        }
        resolve();
      }))
    }
  }
  __initMock(db) {
    this.__mockDB = db;
  }
}

auth0.AuthenticationClient = AuthenticationClient;
auth0.ManagementClient = ManagementClient;

module.exports = auth0;
