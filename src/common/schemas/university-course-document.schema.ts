import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type UniversityCourseDocDocument = UniversityCourseDoc & mongoose.Document;

@Schema({ collection: 'UniversityCourseDocs', autoIndex: true })
export class UniversityCourseDoc {
  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop(raw({ idCourse: mongoose.Types.ObjectId, name: String, searchText: String }))
  course: { idCourse: mongoose.Types.ObjectId; name: string; searchText: string };

  @Prop({ type: String })
  cicleName: string;

  @Prop(
    raw({
      type: []
    })
  )
  teachers: string[];

  @Prop(
    raw({
      type: [
        {
          _id: mongoose.Types.ObjectId,
          student: {
            idStudent: mongoose.Types.ObjectId,
            fullName: String,
            profileUrl: String,
          },
          searchName: String,
          originalName: String,
          documentType: String,
          extension: String,
          url: String
        }
      ]
    })
  )
  documents: {
    _id: mongoose.Types.ObjectId;
    student: {
      idStudent: mongoose.Types.ObjectId;
      fullName: string;
      profileUrl: string;
    };
    searchName: string;
    originalName: string;
    documentType: string;
    extension: string;
    url: string;
  }[];

  @Prop({
    type: AuditPropertiesSchema,
    default: () => new AuditPropertiesSchema()
  })
  auditProperties: AuditPropertiesSchema;
}

export const UniversityCourseDocSchema = SchemaFactory.createForClass(UniversityCourseDoc);
