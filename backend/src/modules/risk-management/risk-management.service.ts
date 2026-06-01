import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { RiskScore } from './entities/risk-score.entity';
import { RiskRule } from './entities/risk-rule.entity';
import { RiskAlert } from './entities/risk-alert.entity';

import { PortfolioService } from '../portfolio/portfolio.service';

@Injectable()
export class RiskManagementService {
  private logger = new Logger('RiskManagementService');

  constructor(
    @InjectRepository(RiskScore) private riskScoreRepository: Repository<RiskScore>,
    @InjectRepository(RiskRule) private riskRuleRepository: Repository<RiskRule>,
    @InjectRepository(RiskAlert) private riskAlertRepository: Repository<RiskAlert>,
    private portfolioService: PortfolioService,
    private configService: ConfigService,
  ) {}

  async calculatePortfolioRisk(userId: string): Promise<RiskScore> {
    try {
      const portfolio = await this.portfolioService.getAssetAllocation(userId);

      if (!portfolio || portfolio.length === 0) {
        return this.createRiskScore(userId, 0, 'LOW', 'Empty portfolio');
      }

      let concentrationRisk = 0;
      let volatilityRisk = 0;
      let liquidityRisk = 0;

      // Calculate concentration risk
      for (const asset of portfolio) {
        const percentage = asset.percentage || 0;
        if (percentage > 50) {
          concentrationRisk = 5; // Critical
        } else if (percentage > 30) {
          concentrationRisk = Math.max(concentrationRisk, 4);
        } else if (percentage > 20) {
          concentrationRisk = Math.max(concentrationRisk, 3);
        } else if (percentage > 10) {
          concentrationRisk = Math.max(concentrationRisk, 2);
        } else {
          concentrationRisk = Math.max(concentrationRisk, 1);
        }
      }

      // Calculate overall risk score (1-5)
      const overallRisk = (concentrationRisk * 0.4 + volatilityRisk * 0.3 + liquidityRisk * 0.3) / 5;

      const riskLevel = this.getRiskLevel(overallRisk);
      const riskReason = this.getRiskReason(portfolio, overallRisk);

      return this.createRiskScore(
        userId,
        Math.min(overallRisk, 5),
        riskLevel,
        riskReason,
      );
    } catch (error) {
      this.logger.error(`Error calculating portfolio risk: ${error.message}`);
      throw error;
    }
  }

  async createRiskRule(
    userId: string,
    ruleName: string,
    ruleType: string,
    condition: Record<string, any>,
    action: string,
  ): Promise<RiskRule> {
    try {
      const rule = this.riskRuleRepository.create({
        userId,
        ruleName,
        ruleType,
        condition,
        action,
        isActive: true,
      });

      const savedRule = await this.riskRuleRepository.save(rule);
      this.logger.log(`Risk rule created: ${ruleName}`);

      return savedRule;
    } catch (error) {
      this.logger.error(`Error creating risk rule: ${error.message}`);
      throw error;
    }
  }

  async getUserRiskRules(userId: string): Promise<RiskRule[]> {
    return this.riskRuleRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async evaluateRiskRules(userId: string): Promise<RiskAlert[]> {
    try {
      const rules = await this.getUserRiskRules(userId);
      const alerts: RiskAlert[] = [];

      for (const rule of rules) {
        if (!rule.isActive) continue;

        // Evaluate rule condition
        const triggered = await this.evaluateCondition(userId, rule);

        if (triggered) {
          const alert = this.riskAlertRepository.create({
            userId,
            riskRuleId: rule.id,
            alertType: rule.ruleType,
            message: `Rule '${rule.ruleName}' triggered`,
            isRead: false,
          });

          const savedAlert = await this.riskAlertRepository.save(alert);
          alerts.push(savedAlert);

          this.logger.warn(`Risk alert: ${rule.ruleName}`);
        }
      }

      return alerts;
    } catch (error) {
      this.logger.error(`Error evaluating risk rules: ${error.message}`);
      throw error;
    }
  }

  async getUserRiskAlerts(userId: string, unreadOnly: boolean = false): Promise<RiskAlert[]> {
    const query: any = { userId };
    if (unreadOnly) query.isRead = false;

    return this.riskAlertRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async markAlertAsRead(userId: string, alertId: string): Promise<void> {
    const alert = await this.riskAlertRepository.findOne({
      where: { id: alertId, userId },
    });

    if (alert) {
      alert.isRead = true;
      await this.riskAlertRepository.save(alert);
    }
  }

  async calculateOrderRisk(
    userId: string,
    exchange: string,
    symbol: string,
    side: string,
    quantity: number,
    price: number,
  ): Promise<any> {
    try {
      const tradeValue = quantity * (price || 1);
      const portfolio = await this.portfolioService.getPortfolioSummary(userId);

      const portfolioValue = portfolio.portfolio.totalValue || 1;
      const riskPercentage = (tradeValue / portfolioValue) * 100;

      const riskScore = this.calculateRiskScore(riskPercentage);
      const riskLevel = this.getRiskLevel(riskScore);

      return {
        tradeValue,
        portfolioValue,
        riskPercentage,
        riskScore: Math.round(riskScore * 10) / 10,
        riskLevel,
        isApproved: riskPercentage <= 5,
      };
    } catch (error) {
      this.logger.error(`Error calculating order risk: ${error.message}`);
      return {
        riskScore: 5,
        riskLevel: 'CRITICAL',
        isApproved: false,
      };
    }
  }

  private async createRiskScore(
    userId: string,
    score: number,
    level: string,
    reason: string,
  ): Promise<RiskScore> {
    const riskScore = this.riskScoreRepository.create({
      userId,
      score,
      level,
      reason,
    });

    return this.riskScoreRepository.save(riskScore);
  }

  private async evaluateCondition(userId: string, rule: RiskRule): Promise<boolean> {
    try {
      const portfolio = await this.portfolioService.getPortfolioSummary(userId);
      const condition = rule.condition;

      // Example conditions
      if (condition.type === 'portfolio_value') {
        if (condition.operator === 'below') {
          return portfolio.portfolio.totalValue < condition.value;
        } else if (condition.operator === 'above') {
          return portfolio.portfolio.totalValue > condition.value;
        }
      }

      if (condition.type === 'drawdown') {
        if (condition.operator === 'exceeds') {
          const drawdown = Math.abs(portfolio.portfolio.returnPercentage);
          return drawdown > condition.value;
        }
      }

      return false;
    } catch (error) {
      this.logger.error(`Error evaluating condition: ${error.message}`);
      return false;
    }
  }

  private calculateRiskScore(riskPercentage: number): number {
    if (riskPercentage < 1) return 1;
    if (riskPercentage < 3) return 2;
    if (riskPercentage < 5) return 3;
    if (riskPercentage < 10) return 4;
    return 5;
  }

  private getRiskLevel(score: number): string {
    if (score <= 1) return 'LOW';
    if (score <= 2) return 'LOW';
    if (score <= 3) return 'MEDIUM';
    if (score <= 4) return 'HIGH';
    return 'CRITICAL';
  }

  private getRiskReason(portfolio: any[], score: number): string {
    if (score >= 4) return 'Portfolio concentration or volatility very high';
    if (score >= 3) return 'Portfolio has moderate risk';
    if (score >= 2) return 'Portfolio has low risk';
    return 'Portfolio well-diversified';
  }
}
