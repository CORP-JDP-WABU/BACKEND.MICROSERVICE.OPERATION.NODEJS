import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UniversityCourseDocument = UniversityCourse & mongoose.Document;

@Schema({ collection: 'UniversityCourses', autoIndex: true })
export class UniversityCourse {
  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  searchText: string;

  @Prop({ type: String })
  code: string;

  @Prop(
    raw({
      type: []
    })
  )
  careers: mongoose.Types.ObjectId[];

  @Prop(
    raw({
      type: [
        {
          _id: mongoose.Types.ObjectId,
          firstName: String,
          lastName: String
        }
      ]
    })
  )
  teachers: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
  }[];
}

export const UniversityCourseSchema = SchemaFactory.createForClass(UniversityCourse);
