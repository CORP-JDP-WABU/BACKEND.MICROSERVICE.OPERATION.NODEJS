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

  @Prop({ type: Number })
  manyQualification: number;

  @Prop(
    raw({
      type: [
        {
          _id: mongoose.Types.ObjectId,
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
          hasIgnor: Boolean,
          hasComment: Boolean,
          hasQualification: Boolean,
        },
      ],
    }),
  )
  pendingToQualification: {
    _id: mongoose.Types.ObjectId;
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
    hasIgnor: boolean;
    hasComment: boolean;
    hasQualification: boolean;
  }[];

  @Prop({
    type: AuditPropertiesSchema,
    default: () => new AuditPropertiesSchema(),
  })
  auditProperties: AuditPropertiesSchema;
}

export const CareerCourseTeacherSchema =
  SchemaFactory.createForClass(CareerCourseTeacher);
