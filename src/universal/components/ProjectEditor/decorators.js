import EditorLink from './EditorLink';
import {CompositeDecorator} from 'draft-js';

const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

const decorators = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: EditorLink,
  },
]);

export default decorators;