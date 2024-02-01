import { Prop, raw } from '@nestjs/mongoose';

export class AuditPropertiesSchema {
  @Prop({
    type: Date,
    default: () => new Date(),
  })
  dateCreate: Date;

  @Prop({
    type: Date,
    default: () => null,
  })
  dateUpdate: Date;

  @Prop({})
  userCreate: string;

  @Prop({
    type: String,
    default: () => null,
  })
  userUpdate: string;

  @Prop({
    type: Boolean,
    default: () => true,
  })
  recordActive: boolean;

  @Prop(
    raw({
      type: [
        {
          code: Number,
          description: String,
        },
      ],
    }),
  )
  status: {
    code: number;
    description: string;
  };
}
