import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as schemas from 'src/common/schemas';
import * as services from './services';
import * as AWS from 'aws-sdk';
import { DocumentController } from './document.controller';
import { SecurityModule } from 'src/common/client/security/security.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from 'src/common/crypto/crypto.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: schemas.Universities.name,
        schema: schemas.UniversitiesSchema
      },
      {
        name: schemas.UniversityCourse.name,
        schema: schemas.UniversityCourseSchema
      },
      {
        name: schemas.UniversityTeacher.name,
        schema: schemas.UniversityTeacherSchema
      },
      {
        name: schemas.UniversityCourseDoc.name,
        schema: schemas.UniversityCourseDocSchema
      },
      {
        name: schemas.ProfileCourse.name,
        schema: schemas.ProfileCourseSchema
      },
      {
        name: schemas.Students.name,
        schema: schemas.StudentsSchema
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
  controllers: [DocumentController],
  providers: [
    services.FnUploadDocumentService,
    services.FnFindDocumentService,
    {
      provide: 'AWS_S3',
      useFactory: () => {
        return new AWS.S3({
          accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
        });
      }
    }
  ]
})
export class DocumentModule {}
