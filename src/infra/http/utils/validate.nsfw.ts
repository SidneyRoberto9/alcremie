interface validateTagListNameIsNsfwResponse {
  tagList: string[];
  isNsfw: boolean;
}

export function validateTagListNameIsNsfw(list: string[]): validateTagListNameIsNsfwResponse {
  const sfwRating: string = 'rating:safe';
  const ratingList: string[] = [sfwRating, 'rating:questionable', 'rating:explicit'];

  const isNsfw = !list.includes(sfwRating);

  const tagListWithoutRating = list.filter((tag) => ratingList.includes(tag) === false);

  return {
    tagList: tagListWithoutRating,
    isNsfw,
  };
}
