import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Core Modules
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

// Feature Modules
import { CorporatesModule } from './corporates/corporates.module';
import { SurveysModule } from './surveys/surveys.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { EventsModule } from './events/events.module';
import { EscalationModule } from './escalation/escalation.module';
import { WellnessModule } from './wellness/wellness.module';
import { PortalModule } from './portal/portal.module';
import { MastersModule } from './masters/masters.module';
import { EmployeesModule } from './employees/employees.module';
import { DocumentModule } from './document/document.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { ClaimsAnalyticsModule } from './claims-analytics/claims-analytics.module';
import { HelpdeskModule } from './helpdesk/helpdesk.module';

// Health Check Controller
import { AppController } from './app.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Core
    DatabaseModule,
    AuthModule,

    // Features
    CorporatesModule,
    SurveysModule,
    ChatbotModule,
    EventsModule,
    EscalationModule,
    WellnessModule,
    PortalModule,
    MastersModule,
    EmployeesModule,
    DocumentModule,
    EmailTemplatesModule,
    ClaimsAnalyticsModule,
    HelpdeskModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
