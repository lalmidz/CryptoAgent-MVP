import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RiskRule } from './risk-rule.entity';

@Entity('risk_alerts')
export class RiskAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid', { nullable: true })
  riskRuleId: string;

  @Column()
  alertType: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => RiskRule, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'riskRuleId' })
  riskRule: RiskRule;
}
