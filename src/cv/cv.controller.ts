
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
  Req,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';

import type { Request } from 'express';

import { PaginationDto } from '../common/dto/pagination.dto.js';
import { CreateCvDto } from './dto/create-cv.dto.js';
import { UpdateCvDto } from './dto/update-cv.dto.js';
import { CvService } from './cv.service.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface.js';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Controller({ path: 'cvs', version: VERSION_NEUTRAL })
@UseGuards(JwtAuthGuard)
export class CvController {

  constructor(
    @Inject(CvService)
    private readonly cvService: CvService,
  ) {}

  // Create a CV for the connected user
  @Post()
  create(
    @Body() dto: CreateCvDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cvService.createForUser(
      dto,
      request.user.userId,
    );
  }

  // Admin sees all CVs; User sees only their CVs
  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cvService.findAllForUser(
      request.user,
      pagination,
    );
  }

  // Admin-only endpoint
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAllAdmin(@Query() pagination: PaginationDto) {
    return this.cvService.findAll(pagination);
  }

  // User can see only their CV; Admin can see any CV
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cvService.findOneForUser(
      id,
      request.user,
    );
  }

  // Only the owner can update their CV
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cvService.updateForUser(
      id,
      request.user.userId,
      dto,
    );
  }

  // Only the owner can delete their CV
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.cvService.removeForUser(
      id,
      request.user.userId,
    );
  }
}
