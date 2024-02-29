import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type TeacherCourseCommentsDocument = TeacherCourseComments &
  mongoose.Document;

@Schema({ collection: 'TeacherCourseComments', autoIndex: true })
export class TeacherCourseComments {
  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idTeacher: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idCourse: mongoose.Types.ObjectId;

  @Prop(
    raw({
      type: [
        {
          _id: mongoose.Types.ObjectId,
          fullName: String,
          profileUrl: String,
          comment: String,
          createdAt: Date,
          createdAtString: String,
          likes: [String],
          dislikes: [String],
        },
      ],
    }),
  )
  students: {
    _id: mongoose.Types.ObjectId;
    fullName: string;
    profileUrl: string;
    comment: string;
    createdAt: Date;
    createdAtString: string;
    likes: string[];
    dislikes: string[];
  }[];

  @Prop({
    type: AuditPropertiesSchema,
    default: () => new AuditPropertiesSchema(),
  })
  auditProperties: AuditPropertiesSchema;
}

export const TeacherCourseCommentsSchema = SchemaFactory.createForClass(
  TeacherCourseComments,
);
