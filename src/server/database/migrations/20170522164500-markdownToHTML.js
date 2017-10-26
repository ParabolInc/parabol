/*
* These packages relied on things that were part of react 15 but not react 16, so they are all broken
* Since we no longer need them, it's easier to comment everything out so we can clean up our package.json #1386
*
*/
// import {convertFromHTML, ContentState, convertToRaw, convertFromRaw, SelectionState} from 'draft-js';
// import MarkdownIt from 'markdown-it';
// import emoji from 'markdown-it-emoji';
// import jsdom from 'jsdom';
// import toMarkdown from 'to-markdown';
// import {stateToHTML} from 'draft-js-export-html';
// import entitizeText from 'universal/utils/draftjs/entitizeText';
// import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';


// const options = {
//  breaks: true,
//  linkify: true,
//  typographer: true
// };


exports.up = async () => {
  // const dom = new jsdom.JSDOM('');
  // global.window = dom.window;
  // global.document = dom.window.document;
  // global.navigator = dom.window.navigator;
  // global.HTMLElement = dom.window.HTMLElement;
  // global.HTMLAnchorElement = dom.window.HTMLAnchorElement;
  // global.HTMLImageElement = dom.window.HTMLImageElement;
  //
  // const md = new MarkdownIt(options);
  // md.use(emoji);
  //
  // const projects = await r.table('Project').pluck('id', 'content');
  // const updates = projects.map((project) => {
  //  const blocksFromHTML = convertFromHTML(md.render(project.content || ''));
  //  const contentState = ContentState.createFromBlockArray(
  //    blocksFromHTML.contentBlocks,
  //    blocksFromHTML.entityMap,
  //  );
  //  const selectionState = new SelectionState({
  //    anchorKey: contentState.getFirstBlock().getKey(),
  //    anchorOffset: 0,
  //    focusKey: contentState.getLastBlock().getKey(),
  //    focusOffset: contentState.getLastBlock().getLength(),
  //    isBackward: false,
  //    hasFocus: false
  //  });
  //  const nextContentState = entitizeText(contentState, selectionState) || contentState;
  //  const raw = convertToRaw(nextContentState);
  //  const tags = getTagsFromEntityMap(raw.entityMap);
  //  const rawString = JSON.stringify(raw);
  //  return r.table('Project').get(project.id).update({content: rawString, tags}).run();
  // });
  // try {
  //  await Promise.all(updates);
  // } catch (e) {
  //  console.log('ERR', e);
  // }
};

exports.down = async () => {

  // const dom = new jsdom.JSDOM('');
  // global.window = dom.window;
  // global.document = dom.window.document;
  // global.navigator = dom.window.navigator;
  // global.HTMLElement = dom.window.HTMLElement;
  // global.HTMLAnchorElement = dom.window.HTMLAnchorElement;
  // global.HTMLImageElement = dom.window.HTMLImageElement;
  //
  // const projects = await r.table('Project').pluck('id', 'content');
  // const updates = projects.map((project) => {
  //  let raw;
  //  try {
  //    raw = JSON.parse(project.content);
  //  } catch (e) {
  //    return undefined;
  //  }
  //  if (!raw) return undefined;
  //  const contentState = convertFromRaw(raw);
  //  const html = stateToHTML(contentState);
  //  const markdown = toMarkdown(html);
  //  return r.table('Project').get(project.id).update({content: markdown}).run();
  // });
  // try {
  //  await Promise.all(updates);
  // } catch (e) {
  //  // noop
  // }
};
