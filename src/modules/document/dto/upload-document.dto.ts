import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestUploadDocumentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  cicleName: string;
}
