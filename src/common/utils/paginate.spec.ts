import type { SelectQueryBuilder } from 'typeorm';
import { paginate } from './paginate.js';

describe('paginate', () => {
  function createQuery(data: { id: number }[], total: number) {
    const query = {
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([data, total]),
    };

    return {
      query,
      builder: query as unknown as SelectQueryBuilder<{ id: number }>,
    };
  }

  it('defaults to the first page of ten items and rounds up the page count', async () => {
    const data = [{ id: 1 }];
    const { builder, query } = createQuery(data, 23);

    await expect(paginate(builder)).resolves.toEqual({
      data,
      total: 23,
      page: 1,
      limit: 10,
      totalPages: 3,
    });
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.take).toHaveBeenCalledWith(10);
  });

  it('converts a one-based page number into the database offset', async () => {
    const data = [{ id: 11 }];
    const { builder, query } = createQuery(data, 23);

    await expect(paginate(builder, { page: 3, limit: 5 })).resolves.toEqual({
      data,
      total: 23,
      page: 3,
      limit: 5,
      totalPages: 5,
    });
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(query.take).toHaveBeenCalledWith(5);
  });

  it.each([
    { total: 0, page: 1, totalPages: 0 },
    { total: 23, page: 6, totalPages: 5 },
  ])(
    'keeps the total when page $page is empty (total: $total)',
    async (expected) => {
      const { builder } = createQuery([], expected.total);

      await expect(
        paginate(builder, { page: expected.page, limit: 5 }),
      ).resolves.toEqual({ data: [], limit: 5, ...expected });
    },
  );
});
