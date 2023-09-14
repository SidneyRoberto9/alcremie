import { z } from 'zod';

import { Query, Param, Get, Controller, BadRequestException } from '@nestjs/common';
import { TagPresenter } from '@/infra/http/presenters/tag.presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { FetchTagsUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-tags/fetch-tags';

const fetchTagParams = z.object({
  page: z.number().min(1),
});

const fetchTagsQuery = z.object({
  limit: z.number().default(25),
});

type FetchTagParams = z.infer<typeof fetchTagParams>;
type FetchTagsQuery = z.infer<typeof fetchTagsQuery>;

const queryValidationPipe = new ZodValidationPipe(fetchTagsQuery);

@Controller('tag')
export class FetchTagController {
  constructor(private readonly fetchTagUseCase: FetchTagsUseCase) {}

  @Get(':page')
  async fetchTag(
    @Param() params: FetchTagParams,
    @Query(queryValidationPipe) query: FetchTagsQuery,
  ) {
    const result = await this.fetchTagUseCase.execute({
      page: params.page,
      size: query.limit,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const tags = result.value.tags;

    return {
      tag: tags.map(TagPresenter.toHTTP),
    };
  }
}
