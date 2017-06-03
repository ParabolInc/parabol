import EditorLink from './EditorLink';
import {CompositeDecorator} from 'draft-js';
import Hashtag from 'universal/components/ProjectEditor/Hashtag';

const findEntity = (entityType) => (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === entityType
      );
    },
    callback
  );
};

const decorators = new CompositeDecorator([
  {
    strategy: findEntity('LINK'),
    component: EditorLink,
  },
  {
    strategy: findEntity('TAG'),
    component: Hashtag
  }
]);

export default decorators;