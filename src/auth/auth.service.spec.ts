import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UserRole } from '../user/enums/user-role.enum.js';
import type { UserService } from '../user/user.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const user = {
    id: 7,
    username: 'ghaith',
    email: 'ghaith@example.com',
    password: '',
    role: UserRole.USER,
    cvs: [],
  };

  let userService: {
    create: ReturnType<typeof vi.fn>;
    findByUsernameWithPassword: ReturnType<typeof vi.fn>;
  };
  let jwtService: { signAsync: ReturnType<typeof vi.fn> };
  let service: AuthService;

  beforeEach(() => {
    userService = {
      create: vi.fn(),
      findByUsernameWithPassword: vi.fn(),
    };
    jwtService = { signAsync: vi.fn() };
    service = new AuthService(
      userService as unknown as UserService,
      jwtService as unknown as JwtService,
    );
  });

  it('registers a user with a hashed password and hides the password', async () => {
    userService.create.mockImplementation(
      async (_dto: unknown, hashedPassword: string) => ({
        ...user,
        password: hashedPassword,
      }),
    );

    const result = await service.register({
      username: user.username,
      email: user.email,
      password: 'password123',
    });

    const storedPassword = userService.create.mock.calls[0][1] as string;
    expect(await compare('password123', storedPassword)).toBe(true);
    expect(result).toEqual({
      id: user.id,
      username: user.username,
      email: user.email,
      role: UserRole.USER,
    });
    expect(result).not.toHaveProperty('password');
  });

  it('returns a signed JWT for valid credentials', async () => {
    const password = await hash('password123', 4);
    userService.findByUsernameWithPassword.mockResolvedValue({
      ...user,
      password,
    });
    jwtService.signAsync.mockResolvedValue('signed.jwt.token');

    const result = await service.login({
      username: user.username,
      password: 'password123',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      username: user.username,
      role: UserRole.USER,
    });
    expect(result).toEqual({ access_token: 'signed.jwt.token' });
  });

  it('rejects invalid credentials', async () => {
    userService.findByUsernameWithPassword.mockResolvedValue(null);

    await expect(
      service.login({ username: 'unknown', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('keeps duplicate-user conflicts from the user service', async () => {
    userService.create.mockRejectedValue(new ConflictException());

    await expect(
      service.register({
        username: user.username,
        email: user.email,
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
