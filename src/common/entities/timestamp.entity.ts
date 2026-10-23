import {
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Abstract base class: it has no @Entity decorator, so it never becomes
// a table by itself. Entities extend it and inherit the three columns.
export abstract class TimestampEntity {
  // Filled automatically at insertion.
  // update: false -> TypeORM never includes this column in an UPDATE,
  // so the creation date cannot be modified afterwards.
  @CreateDateColumn({ update: false })
  createdAt: Date;

  // Refreshed automatically on every update (every save/update call).
  @UpdateDateColumn()
  updatedAt: Date;

  // NULL while the row is alive; receives the date on softDelete.
  // The "?" is because the value is absent for non-deleted rows.
  @DeleteDateColumn()
  deletedAt?: Date;
}