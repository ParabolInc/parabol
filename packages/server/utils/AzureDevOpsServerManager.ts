import fetch from 'node-fetch'
import AzureDevOpsManager from 'parabol-client/utils/AzureDevOpsManager'
import appOrigin from '../appOrigin'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import {
  OAuth2AuthorizationParams,
  OAuth2RefreshAuthorizationParams
} from '../integrations/OAuth2Manager'

class AzureDevOpsServerManager extends AzureDevOpsManager {
  fetch = fetch as any
}
