import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { RiskManagementService } from './risk-management.service';
import { RiskManagementController } from './risk-management.controller';

import { RiskScore } from './entities/risk-score.entity';
import { RiskRule } from './entities/risk-rule.entity';
import { RiskAlert } from './entities/risk-alert.entity';

import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RiskScore, RiskRule, RiskAlert]),
    HttpModule,
    PortfolioModule,
  ],
  controllers: [RiskManagementController],
  providers: [RiskManagementService],
  exports: [RiskManagementService],
})
export class RiskManagementModule {}
