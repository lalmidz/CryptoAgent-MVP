import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_2fa')
export class UserTwoFactor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'text' })
  secret: string;

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  backupCodes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.twoFactor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
