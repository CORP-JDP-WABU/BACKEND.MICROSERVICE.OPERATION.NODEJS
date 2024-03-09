import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UniversityTeacherDocument = UniversityTeacher & mongoose.Document;

@Schema({ collection: 'UniversityTeachers', autoIndex: true })
export class UniversityTeacher {
  @Prop({ type: mongoose.Types.ObjectId })
  idUniversity: mongoose.Types.ObjectId;

  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  fullName: string;

  @Prop({ type: String })
  code: string;

  @Prop({ type: String })
  email: string;

  @Prop(raw({ code: Number, description: String }))
  typeSex: { code: number; description: string };

  @Prop({ type: String })
  url: string;

  @Prop(
    raw({
      type: [
        {
          _id: mongoose.Types.ObjectId,
          name: String,
          manyQualifications: Number,
          manyAverageQualifications: Number,
          manyComments: Number,
          requiredQualifications: [
            {
              qualification: {
                code: Number,
                value: String
              },
              averageQualification: Number
            }
          ],
          optionalQualifications: [
            {
              qualification: {
                code: Number,
                value: String
              },
              averageQualification: Number,
              countQualifications: Number
            }
          ]
        }
      ]
    })
  )
  courses: {
    _id: mongoose.Types.ObjectId;
    name: string;
    manyQualifications: number;
    manyAverageQualifications: number;
    manyComments: number;
    requiredQualifications: [
      {
        qualification: {
          code: number;
          description: string;
        };
        averageQualification: number;
      }
    ];
    optionalQualifications: [
      {
        qualification: {
          code: number;
          description: string;
        };
        averageQualification: number;
        countQualifications: number;
      }
    ];
  }[];
}

export const UniversityTeacherSchema = SchemaFactory.createForClass(UniversityTeacher);
