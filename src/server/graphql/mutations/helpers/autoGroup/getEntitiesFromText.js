import sendSentryEvent from 'server/utils/sendSentryEvent';
import language from '@google-cloud/language/src/index';

const getEntitiesFromText = async (contextText) => {
  const client = new language.LanguageServiceClient();
  const document = {
    contextText,
    type: 'PLAIN_TEXT'
  };
  try {
    return client.analyzeEntities({document});
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
