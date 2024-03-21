import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AuditPropertiesSchema } from './audit-properties.schema';

export type UniversitiesDocument = Universities & mongoose.Document;

@Schema({ collection: 'Universities', autoIndex: true })
export class Universities {
  @Prop({ type: String })
  name: string;

  @Prop(
    raw({
      type: [
        {
          _id: mongoose.Types.ObjectId,
          name: String,
          cicles: [String]
        }
      ]
    })
  )
  careers: {
    _id: mongoose.Types.ObjectId;
    name: string;
    cicles: string[];
  }[];

  @Prop({
    type: AuditPropertiesSchema,
    default: () => new AuditPropertiesSchema()
  })
  auditProperties: AuditPropertiesSchema;
}

export const UniversitiesSchema = SchemaFactory.createForClass(Universities);
