import { Box, Flex, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import CountUp from 'react-countup';

interface StatisticsItemProps {
  number: number;
  name: string;
  icon: ReactNode;
}

export function StatisticItem({ number, name, icon }: StatisticsItemProps) {
  return (
    <Flex
      h={'210px'}
      direction={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      m={{ base: '0.75rem', lg: '3.5rem' }}
    >
      <Box
        bg={'green.300'}
        p={'1.25rem'}
        borderRadius={'full'}
        cursor={'pointer'}
        transition={'all 250ms ease'}
        _hover={{
          transform: 'scale(110%)',
        }}
      >
        {icon}
      </Box>
      <Text fontSize={'1.25rem'} color={'white'} mt={'0.4rem'}>
        <CountUp end={number} delay={1} duration={1.75} />
      </Text>
      <Text fontSize={'1rem'} color={'gray.450'}>
        {name}
      </Text>
    </Flex>
  );
}
