import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('risk_rules')
export class RiskRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  ruleName: string;

  @Column({ enum: ['portfolio_value', 'drawdown', 'concentration', 'volatility'] })
  ruleType: string;

  @Column({ type: 'jsonb' })
  condition: Record<string, any>;

  @Column()
  action: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
