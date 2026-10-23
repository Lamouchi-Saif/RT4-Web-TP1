import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service.js';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get()
  getId() {
    return { id: this.testService.getId() };
  }
}