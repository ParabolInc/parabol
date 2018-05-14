import sendSentryEvent from 'server/utils/sendSentryEvent';
import language from '@google-cloud/language/src/index';

const getEntitiesFromText = async (contextText) => {
  let client;
  // google writes this so horribly wrong that we can't actually catch an error from here, but I write it like this in hopes they change
  try {
    client = new language.LanguageServiceClient();
  } catch (e) {
    sendSentryEvent(undefined, undefined, e);
    return null;
  }
  const document = {
    content: contextText,
    type: 'PLAIN_TEXT'
  };
  try {
    return client.analyzeSyntax({document});
  } catch (e) {
    const breadcrumb = {
      message: e.message,
      category: 'Google cloud language API fail'
    };
    sendSentryEvent(undefined, breadcrumb);
    return null;
  }
};

export default getEntitiesFromText;
