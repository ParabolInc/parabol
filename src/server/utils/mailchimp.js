import Mailchimp from 'mailchimp-api-v3';
import getDotenv from '../../universal/utils/dotenv';
import { getAddOrUpdateMemberPath } from './mailchimpHelpers';

getDotenv();

const {
  MAILCHIMP_LIST_ID,
  MAILCHIMP_API_KEY,
  MAILCHIMP_NAME_MERGE_KEY
} = process.env;
const isConfigured =
  MAILCHIMP_LIST_ID && MAILCHIMP_API_KEY && MAILCHIMP_NAME_MERGE_KEY;
if (!isConfigured) {
  console.log('mailchimp api integration not configured, not syncing users');
  console.log('MAILCHIMP_API_KEY: ', MAILCHIMP_API_KEY);
  console.log('MAILCHIMP_LIST_ID: ', MAILCHIMP_LIST_ID);
  console.log('MAILCHIMP_NAME_MERGE_KEY: ', MAILCHIMP_NAME_MERGE_KEY);
}

function notSetUpFn() {
  return true;
}

const MailChimpAPI = isConfigured ? new Mailchimp(MAILCHIMP_API_KEY) : {
  put: notSetUpFn
};

const mailchimpWrapper = {
  addOrUpdateMemberToList: (email, { preferredName }) => {
    const endpoint = getAddOrUpdateMemberPath(MAILCHIMP_LIST_ID, email);
    const mergeFields = {};
    mergeFields[MAILCHIMP_NAME_MERGE_KEY] = preferredName;
    const requestBody = {
      email_address: email,
      status_if_new: 'subscribed',
      merge_fields: mergeFields
    };

    MailChimpAPI.put(endpoint, requestBody)
      .then(() => {
        // console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const mailchimpMock = {
  addOrUpdateMemberToList: notSetUpFn,
  createMember: notSetUpFn
};

const mailchimp = isConfigured ? mailchimpWrapper : mailchimpMock;

export default mailchimp;
