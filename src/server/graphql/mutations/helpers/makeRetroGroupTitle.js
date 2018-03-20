/*
 * Takes a guess at what the cards are talking about.
 * If that fails, just gives them a generic name
 */
import getRethink from 'server/database/rethinkDriver';
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString';
import language from '@google-cloud/language/src/index';
import sendSentryEvent from 'server/utils/sendSentryEvent';

// This is how we know we caught all the important words. Lower catches more
const SALIENT_THRESHOLD = 0.85;
const MIN_ENTITIES = 2;
const MAX_CHARS = 40;

const getSmartEntities = async (reflections) => {
  const content = reflections
    .map((reflection) => extractTextFromDraftString(reflection.content))
    .join('\n');
  const client = new language.LanguageServiceClient({keyFilename: '../../../../../.googlecloudkey.json'});
  const document = {
    content,
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

const createSmartTitle = (languageResponses) => {
  if (!languageResponses) return null;
  const [firstResponse] = languageResponses;
  if (!firstResponse) return null;
  const {entities} = firstResponse;
  if (!Array.isArray(entities)) return null;
  let cumlSalience = 0;
  const titleArr = [];
  for (let ii = 0; ii < entities.length; ii++) {
    const entity = entities[ii];
    const {name, salience} = entity;
    if (!name || !salience) continue;
    const capName = name[0].toUpperCase() + name.slice(1);
    // if we've used 2 words & adding this word would make it look long & ugly, abort
    if (titleArr.length > MIN_ENTITIES && titleArr.join(' ').length + capName.length > MAX_CHARS) {
      break;
    }
    titleArr.push(capName);
    cumlSalience += salience;
    // if they get the jist, abort
    if (cumlSalience > SALIENT_THRESHOLD) break;
  }
  return titleArr.join(' ');
};

const makeRetroGroupTitle = async (meetingId, reflections) => {
  const r = getRethink();
  const textSummary = await getSmartEntities(reflections);
  const smartTitle = createSmartTitle(textSummary);
  if (smartTitle) {
    const allTitles = await r.table('RetroReflectionGroup')
      .getAll(meetingId, {index: 'meetingId'})
      .filter({isActive: true})('title')
      .default([]);
    if (!allTitles.includes(smartTitle)) {
      return {smartTitle, title: smartTitle};
    }
  }
  const reflectionCount = await r.table('RetroReflectionGroup')
    .getAll(meetingId, {index: 'meetingId'})
    .count();
  const nextCount = reflectionCount + 1;
  return {title: `Group #${nextCount}`};
};

export default makeRetroGroupTitle;
