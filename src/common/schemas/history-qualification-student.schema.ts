import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type HistoryQualificationStudentDocument = HistoryQualificationStudent & mongoose.Document;

@Schema({ collection: 'HistoryQualificationStudent', autoIndex: true })
export class HistoryQualificationStudent {

  @Prop({ type: mongoose.Types.ObjectId })
  idStudent: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idCourse: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idTeacher: mongoose.Types.ObjectId;

  @Prop({ type: Boolean })
  hasComment: boolean;

  @Prop({ type: Boolean })
  hasQualification: boolean;

  @Prop({
    type: AuditPropertiesSchema,
    default: () => new AuditPropertiesSchema()
  })
  auditProperties: AuditPropertiesSchema;
}

export const HistoryQualificationStudentSchema = SchemaFactory.createForClass(HistoryQualificationStudent);
