import {ExternalLinks} from '../../client/types/constEnums'

const makeCreateAzureTaskComment = (
  creator: string,
  assignee: string,
  teamName: string,
  teamDashboardUrl: string
) => {
  return `<div>Created by ${creator} for ${assignee}</div>

  <br>

  <div>See the dashboard of <a href='${teamDashboardUrl}'>${teamName}</a></div>

  <br>

  <div>Powered by <a href='${ExternalLinks.INTEGRATIONS}'>Parabol</a></div>`
  // TODO: update ExternalLinks.INTEGRATIONS to ExternalLinks.INTEGRATIONS_AZURE once Azure page has been written
}

export default makeCreateAzureTaskComment
