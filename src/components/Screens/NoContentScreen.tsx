import { useMediaQuery } from '@chakra-ui/react';
import { SmileyXEyes } from 'phosphor-react';

import { Absolute } from '../Absolute';
import { Screen } from './Screen';

export function NoContentScreen() {
  const [isLessThan800] = useMediaQuery('(max-width: 800px)');

  return (
    <Absolute>
      <Screen
        icon={<SmileyXEyes size={isLessThan800 ? 150 : 300} />}
        title={'No Result Found'}
      />
    </Absolute>
  );
}
