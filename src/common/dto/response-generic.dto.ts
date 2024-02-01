import { ApiProperty } from '@nestjs/swagger';

export class ResponseGenericDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  operation: string;

  @ApiProperty()
  data: any;
}
