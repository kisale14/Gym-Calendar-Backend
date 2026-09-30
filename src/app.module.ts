import { Module } from '@nestjs/common';
import { HelthModule } from './helth/helth.module.js';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config.js';
import { DatabaseModule } from './database/database.module.js';
import { SharedModule } from './shared/shared.module.js';
import { IamModule } from './modules/iam/iam.module.js'

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    HelthModule, 
    DatabaseModule, 
    SharedModule, 
    IamModule
  ],
  providers: [],
})
export class AppModule {}
