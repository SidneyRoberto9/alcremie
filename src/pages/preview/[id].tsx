import { Box, Image as Img, useDisclosure } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';

import { ImageDtoWithTags } from '../../@types/api/img';
import { Tag } from '../../@types/api/tag';
import { Content } from '../../components/Content';
import { EditModal } from '../../components/Preview/EditModal';
import { OptionsBox } from '../../components/Preview/OptionsBox';
import { TagBox } from '../../components/Preview/TagBox';
import { getImageById } from '../../server/query/image.query';
import { getAllTags, getTagByIdList } from '../../server/query/tag.query';
import { imageToDtoWithTags } from '../../utils/converter-data';

interface PreviewProps {
  image: ImageDtoWithTags;
  tags: Tag[];
}

const GridTemplate = {
  base: `"img"
        "option"
        "tags"`,
  lg: `"option img"
      "tags img"
    `,
};

export default function Preview({ image, tags }: PreviewProps) {
  const {
    isOpen: isEditorOpen,
    onOpen: onOpenEditor,
    onClose: onCloseEditor,
  } = useDisclosure();

  return (
    <>
      <NextSeo title="Preview | Alcremie" />
      <EditModal
        isOpen={isEditorOpen}
        onClose={onCloseEditor}
        image={image}
        tags={tags}
      />

      <Content
        display={'flex'}
        h={'auto'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <Box
          display={'grid'}
          gridTemplate={GridTemplate}
          gridTemplateColumns={{ base: '1fr', lg: '350px 1fr' }}
          gridTemplateRows={{
            base: 'auto',
            lg: '4.5rem auto auto auto',
          }}
          h={'100%'}
        >
          <Img
            w={{ base: '100%', md: '720' }}
            h={{ base: '100%', md: '1280' }}
            cursor={'pointer'}
            display={'block'}
            padding={'1rem'}
            gridArea={'img'}
            alt={image.imgurId}
            src={image.imgurUrl}
            objectFit={'cover'}
          />

          <OptionsBox
            handleEdit={onOpenEditor}
            name={image.imgurId}
            url={image.imgurUrl}
            padding={'1.15rem 0'}
            gridArea={'option'}
          />

          <TagBox tags={image.tags} padding={'1rem 0'} gridArea={'tags'} />
        </Box>
      </Content>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  console.log(params);
  if (!params) {
    return {
      notFound: true,
    };
  }

  const ImgData = await getImageById(String(params.id));

  if (!ImgData) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const tagsData = await getTagByIdList(ImgData.tags);
  const returnedImage = imageToDtoWithTags(ImgData, tagsData);
  const tags = await getAllTags();

  return {
    props: {
      image: returnedImage,
      tags,
    },
  };
};
