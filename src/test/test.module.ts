import { Module } from '@nestjs/common';
import { TestService } from './test.service.js';
import { TestController } from './test.controller.js';

@Module({
  providers: [TestService],
  controllers: [TestController]
})
export class TestModule {}
