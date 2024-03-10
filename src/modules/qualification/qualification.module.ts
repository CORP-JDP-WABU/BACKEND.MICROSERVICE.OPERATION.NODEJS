import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QualificationController } from './qualification.controller';
import { CryptoModule } from 'src/common/crypto/crypto.module';
import * as schemas from 'src/common/schemas';
import * as services from './services';
import { SecurityModule } from 'src/common/client/security/security.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: schemas.CareerCourseTeacher.name,
        schema: schemas.CareerCourseTeacherSchema
      },
      {
        name: schemas.UniversityTeacher.name,
        schema: schemas.UniversityTeacherSchema
      },
      {
        name: schemas.HistoryQualificationStudent.name,
        schema: schemas.HistoryQualificationStudent
      }
    ]),
    SecurityModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('client.security'),
      inject: [ConfigService]
    }),
    CryptoModule
  ],
  controllers: [QualificationController],
  providers: [services.FnQualificationIgnorantService, services.FnQualificationService]
})
export class QualificationModule {}
