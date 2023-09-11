import { InMemoryTagRepository } from '@/test/repositories/in-memory-tag.repository';
import { InMemoryRequestRepository } from '@/test/repositories/in-memory-request.repository';
import { InMemoryImageRepository } from '@/test/repositories/in-memory-image.repository';
import { GetStatisticsUseCase } from '@/domain/alcremie/application/use-cases/cases/get-statistics/get-statistics';

let inMemoryImageRepository: InMemoryImageRepository;
let inMemoryTagRepository: InMemoryTagRepository;
let inMemoryRequestRepository: InMemoryRequestRepository;
let sut: GetStatisticsUseCase;

describe('Get Statistics', () => {
  beforeEach(() => {
    inMemoryImageRepository = new InMemoryImageRepository();
    inMemoryTagRepository = new InMemoryTagRepository();
    inMemoryRequestRepository = new InMemoryRequestRepository();
    sut = new GetStatisticsUseCase(
      inMemoryImageRepository,
      inMemoryTagRepository,
      inMemoryRequestRepository,
    );
  });

  it('should be able to get statistics', async () => {
    const result = await sut.execute({});

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      image: expect.any(Number),
      tag: expect.any(Number),
      request: expect.any(Number),
    });
  });
});
