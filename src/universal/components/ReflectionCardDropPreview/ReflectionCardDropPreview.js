/**
 * Renders a flat shadow representing where a reflection card will land.
 *
 * @flow
 */
import styled from 'react-emotion';

import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const ReflectionCardDropPreview = styled('div')({
  backgroundColor: appTheme.palette.light90g,
  borderRadius: 3,
  height: '3rem',
  width: ui.retroCardWidth
});

export default ReflectionCardDropPreview;
