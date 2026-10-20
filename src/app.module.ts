import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PlatformModule } from './platform/platform.module.js';

@Module({
  imports: [PlatformModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
