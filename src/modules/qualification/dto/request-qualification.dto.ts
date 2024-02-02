import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

class QualificationRequired {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  learn: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  hight: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  goodPeople: number;
}

class QualificationOptional {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  worked: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  late: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  assistance: number;
}

export class RequestQualificationDto {
  @ApiProperty({ type: QualificationRequired, isArray: false })
  required: QualificationRequired;

  @ApiProperty({ type: QualificationOptional, isArray: false })
  optional: QualificationOptional;
}
