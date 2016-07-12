import {graphql} from 'graphql';
import Schema from './rootSchema';
import subscriptions from 'universal/redux/subscriptions';

export const wsGraphQLHandler = async(body, cb) => {
  const {query, variables, ...context} = body;
  const authToken = this.getAuthToken();
  const docId = variables.doc && variables.doc.id || variables.id;
  if (!docId) {
    console.warn('No documentId found for the doc submitted via websockets!');
    return cb({_error: 'No documentId found'});
  }
  this.docQueue.add(docId);
  const fullContext = {authToken, socket: this, ...context};
  const {errors, data} = await graphql(Schema, query, {}, fullContext, variables);
  if (errors) {
    this.docQueue.delete(docId);
    return cb(errors);
  }
  return cb(null, data);
};

/*
 * This is where you add subscription logic
 * It's a lookup table that turns a channelName into a graphQL query
 * By creating this on the server it keeps payloads really small
 * */
const variableParser = {
  meeting(variablesStr) {
    return {meetingId: variablesStr};
  }
};

// This should be arrow syntax, but doesn't work when it is
export async function wsGraphQLSubHandler(subbedChannelName) {
  const authToken = this.getAuthToken();
  const firstSlashLoc = subbedChannelName.indexOf('/');
  const subscriptionName = subbedChannelName.substr(0,firstSlashLoc);
  const channelVars = subbedChannelName.substr(firstSlashLoc+1);
  const queryString = subscriptions.find(sub => sub.channel === subscriptionName).string;
  const variables = variableParser[subscriptionName](channelVars);
  const context = {
    authToken,
    socket: this,
    subbedChannelName
  };
  // swallow return value, it's a subscription
  graphql(Schema, queryString, {}, context, variables);
}
