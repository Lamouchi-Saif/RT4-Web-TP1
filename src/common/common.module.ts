import { Global, Module } from '@nestjs/common';
import { UuidProvider } from './providers/uuid.provider.js';

@Global() // Ce module va être souvent utilisé pensez à ca en le créant
@Module({
  providers: [UuidProvider],
  exports: [UuidProvider],
})
export class CommonModule {}
