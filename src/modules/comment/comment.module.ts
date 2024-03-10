import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from 'src/common/crypto/crypto.module';
import * as schemas from 'src/common/schemas';
import * as services from './services';
import { SecurityModule } from 'src/common/client/security/security.module';
import { CommentController } from './comment.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: schemas.UniversityTeacher.name,
        schema: schemas.UniversityTeacherSchema
      },
      {
        name: schemas.TeacherCourseComments.name,
        schema: schemas.TeacherCourseCommentsSchema
      },
      {
        name: schemas.CareerCourseTeacher.name,
        schema: schemas.CareerCourseTeacherSchema
      },
      {
        name: schemas.Students.name,
        schema: schemas.StudentsSchema
      },
      {
        name: schemas.HistoryQualificationStudent.name,
        schema: schemas.HistoryQualificationStudentSchema
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
  controllers: [CommentController],
  providers: [services.FnCommentService]
})
export class CommentModule {}
