/**
 * Renders a flat shadow representing where a reflection card will land.
 *
 * @flow
 */
import styled from 'react-emotion';

import appTheme from 'universal/styles/theme/appTheme';

type Props = {
  // Height of this drop shadow - should be computed from the height of the
  // reflection card being dragged.
  height: string
};

const ReflectionCardDropPreview = styled('div')(({height}: Props) => ({
  backgroundColor: appTheme.palette.mid20a,
  borderRadius: 3,
  height,
  width: '20rem'
}));

export default ReflectionCardDropPreview;
