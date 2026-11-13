import { Test } from '@nestjs/testing';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { CvModule } from '../src/cv/cv.module.js';
import { SkillModule } from '../src/skill/skill.module.js';
import { UserEntity } from '../src/user/entities/user.entity.js';

/** Vraie persistance relationnelle, isolée de MySQL et des données du TP1. */
describe('CRUD CV / Skills (HTTP + TypeORM)', () => {
  let app: INestApplication<App>;
  let database: DataSource;
  let user: UserEntity;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqljs',
          autoLoadEntities: true,
          synchronize: true,
        }),
        CvModule,
        SkillModule,
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.enableVersioning({ type: VersioningType.URI });
    await app.init();
    database = app.get(DataSource);
  }, 30000);

  beforeEach(async () => {
    await database.synchronize(true);
    user = await database.getRepository(UserEntity).save({
      username: 'jed',
      email: 'jed@example.test',
      password: 'fixture-only-not-an-authentication-endpoint',
    });
  });

  afterAll(async () => {
    await app?.close();
  });

  const api = () => request(app.getHttpServer());
  const cvBody = () => ({
    name: 'Jmili',
    firstname: 'Jed',
    age: 22,
    cin: '01234567',
    job: 'Développeur',
    path: 'uploads/jed.png',
    userId: user.id,
  });

  it('persists the complete Skill lifecycle and returns 404 after deletion', async () => {
    const created = await api()
      .post('/skills')
      .send({ designation: 'NestJS' })
      .expect(201);
    const id = created.body.id;
    await api()
      .get(`/skills/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.designation).toBe('NestJS');
      });
    await api()
      .patch(`/skills/${id}`)
      .send({ designation: 'TypeORM' })
      .expect(200);
    await api()
      .get('/skills')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        });
        expect(res.body.data[0].designation).toBe('TypeORM');
      });
    await api().delete(`/skills/${id}`).expect(204);
    await api().get(`/skills/${id}`).expect(404);
  });

  it('persists a CV, updates only supplied fields, and keeps User/Skills on deletion', async () => {
    const skill = await api()
      .post('/skills')
      .send({ designation: 'NestJS' })
      .expect(201);
    const created = await api()
      .post('/cvs')
      .send({ ...cvBody(), skillIds: [skill.body.id] })
      .expect(201);
    const id = created.body.id;
    expect(created.body.userId).toBe(user.id);
    expect(created.body).not.toHaveProperty('user');
    expect(created.body).not.toHaveProperty('password');
    expect(created.body.skills).toEqual([
      expect.objectContaining({ id: skill.body.id }),
    ]);

    await api().patch(`/cvs/${id}`).send({ age: 23 }).expect(200);
    await api()
      .get(`/cvs/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ ...cvBody(), age: 23 });
        expect(res.body.skills).toHaveLength(1);
      });
    await api()
      .get('/cvs')
      .expect(200)
      .expect((res) => {
        expect(res.body.total).toBe(1);
        expect(res.body.data[0].skills).toHaveLength(1);
      });
    await api().delete(`/cvs/${id}`).expect(204);
    await api().get(`/cvs/${id}`).expect(404);
    await api().get(`/skills/${skill.body.id}`).expect(200);
    expect(await database.getRepository(UserEntity).count()).toBe(1);
  });

  it('replaces and clears skills without deleting shared Skill records', async () => {
    const first = await api()
      .post('/skills')
      .send({ designation: 'NestJS' })
      .expect(201);
    const second = await api()
      .post('/skills')
      .send({ designation: 'TypeORM' })
      .expect(201);
    const created = await api()
      .post('/cvs')
      .send({ ...cvBody(), skillIds: [first.body.id] })
      .expect(201);
    const id = created.body.id;
    await api()
      .patch(`/cvs/${id}`)
      .send({ skillIds: [second.body.id] })
      .expect(200);
    await api()
      .get(`/cvs/${id}`)
      .expect(200)
      .expect((res) => {
        expect(
          res.body.skills.map((skill: { id: number }) => skill.id),
        ).toEqual([second.body.id]);
      });
    await api().patch(`/cvs/${id}`).send({ skillIds: [] }).expect(200);
    await api()
      .get(`/cvs/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.skills).toEqual([]);
      });
    await api()
      .get('/skills')
      .expect(200)
      .expect((res) => expect(res.body.total).toBe(2));
  });

  it('deletes a linked Skill without deleting its CV', async () => {
    const skill = await api()
      .post('/skills')
      .send({ designation: 'NestJS' })
      .expect(201);
    const cv = await api()
      .post('/cvs')
      .send({ ...cvBody(), skillIds: [skill.body.id] })
      .expect(201);
    await api().delete(`/skills/${skill.body.id}`).expect(204);
    await api()
      .get(`/cvs/${cv.body.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.skills).toEqual([]);
      });
  });

  it('rejects nonexistent relations without persisting a partial create/update', async () => {
    await api()
      .post('/cvs')
      .send({ ...cvBody(), userId: 999 })
      .expect(404);
    await api()
      .post('/cvs')
      .send({ ...cvBody(), skillIds: [999] })
      .expect(404);
    await api()
      .get('/cvs')
      .expect(200)
      .expect((res) => expect(res.body.total).toBe(0));
    const skill = await api()
      .post('/skills')
      .send({ designation: 'NestJS' })
      .expect(201);
    const created = await api()
      .post('/cvs')
      .send({ ...cvBody(), skillIds: [skill.body.id] })
      .expect(201);
    const id = created.body.id;
    await api()
      .patch(`/cvs/${id}`)
      .send({ name: 'Changed', skillIds: [skill.body.id, 999] })
      .expect(404);
    await api().patch(`/cvs/${id}`).send({ userId: 999 }).expect(404);
    await api()
      .get(`/cvs/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Jmili');
        expect(res.body.userId).toBe(user.id);
        expect(res.body.skills).toHaveLength(1);
      });
  });

  it('paginates CVs with multiple skills without duplicate CVs or truncated relations', async () => {
    const first = await api()
      .post('/skills')
      .send({ designation: 'NestJS' })
      .expect(201);
    const second = await api()
      .post('/skills')
      .send({ designation: 'TypeORM' })
      .expect(201);
    for (let index = 0; index < 3; index++) {
      await api()
        .post('/cvs')
        .send({ ...cvBody(), skillIds: [first.body.id, second.body.id] })
        .expect(201);
    }
    await api()
      .get('/cvs?page=2&limit=2')
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          total: 3,
          page: 2,
          limit: 2,
          totalPages: 2,
        });
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].skills).toHaveLength(2);
      });
  });

  it.each([
    { name: '' },
    { age: -1 },
    { age: 1.5 },
    { age: '22' },
    { cin: 12345678 },
    { userId: 0 },
    { skillIds: '1' },
    { skillIds: [0] },
    { skillIds: [1, 1] },
    { skillIds: null },
    { id: 99 },
    { user: { id: 1 } },
    { name: 'a'.repeat(101) },
  ])('rejects invalid CV data: %j', async (invalid) => {
    await api()
      .post('/cvs')
      .send({ ...cvBody(), ...invalid })
      .expect(400);
  });

  it('requires the fields at creation and rejects null/invalid fields on PATCH', async () => {
    await api().post('/cvs').send({}).expect(400);
    const created = await api().post('/cvs').send(cvBody()).expect(201);
    for (const patch of [
      { name: null },
      { userId: null },
      { skillIds: null },
      { age: 0 },
      { id: 5 },
    ]) {
      await api().patch(`/cvs/${created.body.id}`).send(patch).expect(400);
    }
    await api().patch(`/cvs/${created.body.id}`).send({}).expect(200);
  });

  it.each([
    { designation: '' },
    { designation: 42 },
    {},
    { designation: null },
    { designation: 'x', id: 5 },
  ])('rejects invalid Skill data: %j', async (body) => {
    await api().post('/skills').send(body).expect(400);
  });

  it.each(['cvs', 'skills'])(
    'validates ids/pagination and handles missing %s',
    async (resource) => {
      await api().get(`/${resource}/abc`).expect(400);
      await api().get(`/${resource}?page=0`).expect(400);
      await api().get(`/${resource}?limit=101`).expect(400);
      await api().get(`/${resource}/999`).expect(404);
      await api().patch(`/${resource}/999`).send({}).expect(404);
      await api().delete(`/${resource}/999`).expect(404);
    },
  );
});
