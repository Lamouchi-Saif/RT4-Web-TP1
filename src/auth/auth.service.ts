import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UserService } from '../user/user.service.js';
import type { UserEntity } from '../user/entities/user.entity.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await hash(dto.password, 10);
    const user = await this.userService.create(dto, hashedPassword);

    return this.toPublicUser(user);
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findByUsernameWithPassword(
      dto.username,
    );

    if (!user || !(await compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  private toPublicUser(user: UserEntity) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
