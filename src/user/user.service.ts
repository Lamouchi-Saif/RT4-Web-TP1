import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity.js';
import type { RegisterDto } from '../auth/dto/register.dto.js';
import { UserRole } from './enums/user-role.enum.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} introuvable`);
    }
    return user;
  }

  findByUsernameOrEmail(
    username: string,
    email: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: [{ username }, { email }],
    });
  }

  findByUsernameWithPassword(username: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
      },
    });
  }

  async create(dto: RegisterDto, hashedPassword: string): Promise<UserEntity> {
    const existingUser = await this.findByUsernameOrEmail(
      dto.username,
      dto.email,
    );

    if (existingUser) {
      throw new ConflictException('Username or email already used');
    }

    const user = this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return this.userRepository.save(user);
  }
}
