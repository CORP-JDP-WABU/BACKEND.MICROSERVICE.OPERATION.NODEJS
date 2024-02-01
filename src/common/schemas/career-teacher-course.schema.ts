import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type CareerCourseTeacherDocument = CareerCourseTeacher &
  mongoose.Document;

@Schema({ collection: 'CareerCourseTeacher', autoIndex: true })
export class CareerCourseTeacher {
  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idCareer: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idStudent: mongoose.Types.ObjectId;

  @Prop(
    raw({
      type: [
        {
          course: {
            idCourse: String,
            name: String,
          },
          teacher: {
            idTeacher: String,
            firstName: String,
            lastName: String,
            photoUrl: String,
          },
        },
      ],
    }),
  )
  pendingToQualification: {
    course: {
      idCourse: string;
      name: string;
    };
    teacher: {
      idTeacher: string;
      firstName: string;
      lastName: string;
      photoUrl: string;
    };
  }[];

  @Prop({
    type: AuditPropertiesSchema,
    default: () => new AuditPropertiesSchema(),
  })
  auditProperties: AuditPropertiesSchema;
}

export const CareerCourseTeacherSchema =
  SchemaFactory.createForClass(CareerCourseTeacher);
