import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type ProfileCourseDocument = ProfileCourse & mongoose.Document;

@Schema({ collection: 'ProfileCourses', autoIndex: true })
export class ProfileCourse {
  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  averageQualification: number;

  @Prop({ type: Number })
  quantityComment: number;

  @Prop(
    raw({
      type: [
        {
          _id: mongoose.Types.ObjectId,
          firstName: String,
          lastName: String,
          averageQualification: Number
        }
      ]
    })
  )
  teachers: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    averageQualification: number;
  }[];

  @Prop(
    raw({
      exams: Number,
      excercies: Number,
      notes: Number,
      summary: Number,
      presentations: Number,
      worked: Number,
      syllables: Number
    })
  )
  documents: {
    exams: number;
    excercies: number;
    notes: number;
    summary: number;
    presentations: number;
    worked: number;
    syllables: number;
  };

  @Prop({
    type: AuditPropertiesSchema,
    default: () => new AuditPropertiesSchema()
  })
  auditProperties: AuditPropertiesSchema;
}

export const ProfileCourseSchema = SchemaFactory.createForClass(ProfileCourse);
