import {identityManager} from './ServerIdentityManager'

export const INSTANCE_ID = `${identityManager.getId()}:${process.pid}`
