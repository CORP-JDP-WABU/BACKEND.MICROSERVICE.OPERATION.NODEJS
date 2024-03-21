import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { QualificationModule } from './modules/qualification/qualification.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { CommentModule } from './modules/comment/comment.module';
import { AnalitycModule } from './modules/analytic/analityc.module';
import { DocumentModule } from './modules/document/document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('mongodb')
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([]),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('http.throttle.ttl'),
        limit: config.get('http.throttle.limit')
      })
    }),
    QualificationModule,
    CommentModule,
    DocumentModule,
    CryptoModule,
    AnalitycModule
  ],
  controllers: [AppController],
  providers: [],
  exports: []
})
export class AppModule {}
