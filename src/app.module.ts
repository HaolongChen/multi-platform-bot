import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PlatformModule } from './platform/platform.module.js';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.schema.js';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
		PlatformModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
