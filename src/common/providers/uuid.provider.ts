import { v4 as uuidv4 } from 'uuid';

export const UUID_TOKEN = 'UUID';

export const UuidProvider = {
  provide: UUID_TOKEN,
  useValue: uuidv4,
};