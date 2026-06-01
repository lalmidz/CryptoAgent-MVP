import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { RiskManagementService } from './risk-management.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@ApiTags('Risk Management')
@Controller('risk')
export class RiskManagementController {
  private logger = new Logger('RiskManagementController');

  constructor(private riskService: RiskManagementService) {}

  @Get('portfolio-risk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate portfolio risk' })
  async calculatePortfolioRisk(@Req() req: any) {
    return this.riskService.calculatePortfolioRisk(req.user.id);
  }

  @Post('rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create risk rule' })
  async createRule(
    @Body()
    body: {
      ruleName: string;
      ruleType: string;
      condition: Record<string, any>;
      action: string;
    },
    @Req() req: any,
  ) {
    return this.riskService.createRiskRule(
      req.user.id,
      body.ruleName,
      body.ruleType,
      body.condition,
      body.action,
    );
  }

  @Get('rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user risk rules' })
  async getRules(@Req() req: any) {
    return this.riskService.getUserRiskRules(req.user.id);
  }

  @Get('alerts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get risk alerts' })
  async getAlerts(
    @Query('unreadOnly') unreadOnly: boolean = false,
    @Req() req: any,
  ) {
    return this.riskService.getUserRiskAlerts(req.user.id, unreadOnly);
  }

  @Put('alerts/:alertId/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark alert as read' })
  async markAlertAsRead(
    @Param('alertId') alertId: string,
    @Req() req: any,
  ) {
    await this.riskService.markAlertAsRead(req.user.id, alertId);
    return { message: 'Alert marked as read' };
  }

  @Post('evaluate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Evaluate risk rules' })
  async evaluateRules(@Req() req: any) {
    return this.riskService.evaluateRiskRules(req.user.id);
  }
}
