import { Injectable } from '@nestjs/common';
import { Tag } from '@/domain/alcremie/enterprise/entities/tag';
import { CreateTagUseCase } from '@/domain/alcremie/application/use-cases/cases/create-tag/create-tag';

@Injectable()
export class TagService {
  constructor(private readonly createTagUseCase: CreateTagUseCase) {}

  async validateTagNameListInTagIdList(tagNameList: string[]): Promise<string[]> {
    const tagList: Tag[] = [];

    for (const tagName of tagNameList) {
      const response = await this.createTagUseCase.execute({ name: tagName });

      if (response.isRight()) {
        const tag = response.value?.tag as Tag;
        tagList.push(tag);
      }
    }

    const tagIdList = tagList.map((tag) => tag.id.toValue());

    return tagIdList;
  }
}
