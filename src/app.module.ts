import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PlatformModule } from './platform/platform.module.js';
import { ConfigModule } from './config/config.module.js';

@Module({
  imports: [PlatformModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
