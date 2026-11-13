import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { TodoService } from '../todo/todo.service.js';
import { UserService } from '../user/user.service.js';
import { SkillService } from '../skill/skill.service.js';
import { CvService } from '../cv/cv.service.js';
import {
  randText,
  rand,
  randFirstName,
  randLastName,
  randEmail,
  randJobTitle,
  randSkill,
  randNumber,
  randFilePath,
  randUserName,
  randPassword,
} from '@ngneat/falso';
import { TodoStatusEnum } from '../todo/enums/todo-status.enum.js';
import { hash } from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const todoService = app.get(TodoService);
  const userService = app.get(UserService);
  const skillService = app.get(SkillService);
  const cvService = app.get(CvService);

  // --- Seed Skills ---
  const numberOfSkills = 10;
  const skills: { id: number }[] = [];

  for (let i = 0; i < numberOfSkills; i++) {
    const skill = await skillService.create({
      designation: randSkill(),
    });
    skills.push(skill);
    console.log(`[Skill ${i + 1}/${numberOfSkills}] ${skill.designation}`);
  }

  // --- Seed Users ---
  const numberOfUsers = 5;
  const users: { id: number }[] = [];
  const defaultPassword = await hash('password123', 10);

  for (let i = 0; i < numberOfUsers; i++) {
    const username = randUserName() + randNumber({ min: 100, max: 999 });
    const user = await userService.create(
      {
        username,
        email: randEmail(),
        password: 'password123',
      },
      defaultPassword,
    );
    users.push(user);
    console.log(`[User ${i + 1}/${numberOfUsers}] ${user.username}`);
  }

  // --- Seed CVs ---
  const numberOfCvs = 10;

  for (let i = 0; i < numberOfCvs; i++) {
    const owner = rand(users);
    const cvSkills = rand(skills, { length: randNumber({ min: 1, max: 3 }) });
    const skillIds = [...new Set(cvSkills.map((s) => s.id))];

    const cv = await cvService.create({
      name: randLastName(),
      firstname: randFirstName(),
      age: randNumber({ min: 20, max: 60 }),
      cin: String(randNumber({ min: 10000000, max: 99999999 })),
      job: randJobTitle(),
      path: randFilePath(),
      userId: owner.id,
      skillIds,
    });
    console.log(`[CV ${i + 1}/${numberOfCvs}] ${cv.firstname} ${cv.name} — ${cv.job}`);
  }

  // --- Seed Todos ---
  const statuses = Object.values(TodoStatusEnum);
  const numberOfTodos = 20;

  for (let i = 0; i < numberOfTodos; i++) {
    const name = randText({ charCount: 8 });
    const description = randText({ charCount: 30 });
    const status = rand(statuses);

    const todo = await todoService.addTodo({ name, description });

    await todoService.updateTodo(todo.id, { status });

    console.log(`[Todo ${i + 1}/${numberOfTodos}] ${todo.name}`);
  }

  console.log('\nSeeding complete:');
  console.log(`  - ${numberOfSkills} skills`);
  console.log(`  - ${numberOfUsers} users (password: password123)`);
  console.log(`  - ${numberOfCvs} CVs`);
  console.log(`  - ${numberOfTodos} todos`);

  await app.close();
}

bootstrap();
