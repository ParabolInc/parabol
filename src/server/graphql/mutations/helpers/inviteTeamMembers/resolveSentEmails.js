// can't use Promise.all because we want to try n+1, even if n was an error. we're not quitters!
export default async function resolveSentEmails(sendEmailPromises, inviteesWithTokens) {
  const inviteeErrors = [];
  const inviteesToStore = [];
  for (let i = 0; i < sendEmailPromises.length; i++) {
    const promise = sendEmailPromises[i];
    const invitee = inviteesWithTokens[i];
    const resolvedPromise = await promise; // eslint-disable-line no-await-in-loop
    const arrayToFill = resolvedPromise ? inviteesToStore : inviteeErrors;
    arrayToFill.push(invitee);
  }
  return {inviteeErrors, inviteesToStore};
};
