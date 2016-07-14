import shortid from 'shortid';


export function makeToken() {
  return shortid();
}

export function validateTokenType(tokenString) {
  return shortid.isValid(tokenString);
}
