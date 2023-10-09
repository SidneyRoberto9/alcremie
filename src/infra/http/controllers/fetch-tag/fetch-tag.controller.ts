import { z } from 'zod';

import { SkipThrottle } from '@nestjs/throttler';
import { Query, Get, Controller, BadRequestException } from '@nestjs/common';
import { TagPresenter } from '@/infra/http/presenters/tag.presenter';
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation.pipe';
import { FetchTagsUseCase } from '@/domain/alcremie/application/use-cases/cases/fetch-tags/fetch-tags';

const fetchTagsQuery = z.object({
  q: z.string().default(''),
  limit: z
    .string()
    .default('25')
    .transform((item) => parseInt(item)),
});

type FetchTagsQuery = z.infer<typeof fetchTagsQuery>;

const queryValidationPipe = new ZodValidationPipe(fetchTagsQuery);

@SkipThrottle()
@Controller('tag')
export class FetchTagController {
  constructor(private readonly fetchTagUseCase: FetchTagsUseCase) {}

  @Get('')
  async fetchTag(@Query(queryValidationPipe) query: FetchTagsQuery) {
    const result = await this.fetchTagUseCase.execute({
      q: query.q,
      size: query.limit,
    });

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const tags = result.value.tags;

    return { tag: tags.map(TagPresenter.toHTTP) };
  }
}
