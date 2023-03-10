import { useEffect } from 'react';
import ReactSelect from 'react-select';
import { useContextSelector } from 'use-context-selector';

import { GetGalleryDataParams, SelectOption } from '../../@types/gallery';
import { tagsContext } from '../../context/useTags';
import { selectTagStyle } from '../../styles/react-select-tag';
import { Capitalize } from '../../utils/captalize';

interface FilterTagsProps {
  onGetGalleryData: (
    page: number,
    params: GetGalleryDataParams,
  ) => Promise<void>;
}

export function FilterTags({ onGetGalleryData }: FilterTagsProps) {
  const data = useContextSelector(tagsContext, ({ data }) => data);

  const options: SelectOption[] = [
    { value: '0', label: 'All' },
    { value: '1', label: 'NSFW' },
  ];

  data.forEach((tag) =>
    options.push({ value: tag.id, label: Capitalize(tag.name) }),
  );

  async function handleChange(props: any) {
    const value = props?.value || false;
    const label = props?.label || false;

    const isFilter = {
      isAll: label === 'All' || value === '0',
      isNsfw: label === 'NSFW' || value === '1',
      isTag: value != '0' && value != '1',
    };

    const params: GetGalleryDataParams = {
      all: isFilter.isAll ? true : false,
      is_nsfw: isFilter.isNsfw ? true : false,
      included_tags: isFilter.isTag ? label.toLowerCase() : '',
    };

    await onGetGalleryData(0, params);
  }

  return (
    <ReactSelect
      id={'select-box'}
      instanceId={'select-box'}
      styles={selectTagStyle}
      onChange={handleChange}
      isClearable={true}
      options={options}
    />
  );
}
