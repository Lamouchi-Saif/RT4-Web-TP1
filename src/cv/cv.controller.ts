import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { CreateCvDto } from './dto/create-cv.dto.js';
import { UpdateCvDto } from './dto/update-cv.dto.js';
import { CvService } from './cv.service.js';

@Controller({ path: 'cvs', version: VERSION_NEUTRAL })
export class CvController {
  constructor(@Inject(CvService) private readonly cvService: CvService) {}

  @Post()
  create(@Body() dto: CreateCvDto) {
    return this.cvService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.cvService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCvDto) {
    return this.cvService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cvService.remove(id);
  }
}
