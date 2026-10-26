import { ValidationPipe } from '@nestjs/common';
import { SearchTodoDto } from './search-todo.dto.js';
import { TodoStatusEnum } from '../enums/todo-status.enum.js';

describe('SearchTodoDto query validation', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  const transform = (query: Record<string, unknown>) =>
    pipe.transform(query, { type: 'query', metatype: SearchTodoDto });

  it('converts pagination strings into numbers and preserves the filters', async () => {
    await expect(
      transform({
        page: '2',
        limit: '5',
        search: 'nest',
        status: TodoStatusEnum.actif,
      }),
    ).resolves.toMatchObject({
      page: 2,
      limit: 5,
      search: 'nest',
      status: TodoStatusEnum.actif,
    });
  });

  it('accepts a request without pagination parameters', async () => {
    await expect(transform({})).resolves.toBeInstanceOf(SearchTodoDto);
  });

  it.each([
    { page: '0' },
    { page: '-1' },
    { page: '1.5' },
    { page: 'abc' },
    { page: '' },
    { limit: '0' },
    { limit: '-1' },
    { limit: '2.5' },
    { limit: 'abc' },
    { limit: '' },
    { limit: '101' },
  ])('rejects invalid pagination: %j', async (query) => {
    await expect(transform(query)).rejects.toMatchObject({ status: 400 });
  });
});
