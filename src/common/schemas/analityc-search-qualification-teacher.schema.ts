import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type AnalitycSearchQualificationTeachersDocument = AnalitycSearchQualificationTeachers & mongoose.Document;

@Schema({ collection: 'AnalitycSearchQualificationTeachers', autoIndex: true })
export class AnalitycSearchQualificationTeachers {

  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idCareer: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idStudent: mongoose.Types.ObjectId;

  @Prop({ type: String })
  module: string;

  @Prop({ type: String })
  parameters: string;

  @Prop({ type: AuditPropertiesSchema })
  auditProperties: AuditPropertiesSchema;
}

export const AnalitycSearchQualificationTeachersSchema = SchemaFactory.createForClass(AnalitycSearchQualificationTeachers);
