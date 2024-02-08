import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type AnalitycSearchCourseTeachersDocument = AnalitycSearchCourseTeachers & mongoose.Document;

@Schema({ collection: 'AnalitycSearchCourseTeachers', autoIndex: true })
export class AnalitycSearchCourseTeachers {

  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idCareer: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Types.ObjectId })
  idStudent: mongoose.Types.ObjectId;

  @Prop({ type: Number })
  numberOfRepetitions: number;

  @Prop({ type: String })
  module: string;

  @Prop({ type: String })
  parameters: string;

  @Prop({ type: AuditPropertiesSchema })
  auditProperties: AuditPropertiesSchema;
}

export const AnalitycSearchCourseTeachersSchema = SchemaFactory.createForClass(AnalitycSearchCourseTeachers);
