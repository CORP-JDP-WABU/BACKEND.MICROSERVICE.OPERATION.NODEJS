import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalitycController } from './analityc.controller';
import * as schemas from 'src/common/schemas';
import * as services from './services';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: schemas.AnalitycSearchCourseTeachers.name,
        schema: schemas.AnalitycSearchCourseTeachersSchema
      },
      {
        name: schemas.AnalitycSearchQualificationTeachers.name,
        schema: schemas.AnalitycSearchQualificationTeachersSchema
      }
    ])
  ],
  controllers: [AnalitycController],
  providers: [services.FnSearchCourseTeachersService, services.FnSearchQualificationTeachersService]
})
export class AnalitycModule {}
