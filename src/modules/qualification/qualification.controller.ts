import { Controller, Post, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
    ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';

import * as response from 'src/common/dto';
import * as exception from 'src/exception';
import * as services from './services';
import { SecurityGuard } from 'src/common/guard';
import { UserDecoratorInterface } from 'src/common/interfaces';
import { UserDecorator } from 'src/common/decorator';

@ApiBearerAuth()
@UseGuards(SecurityGuard, ThrottlerGuard)
@Controller('qualification/v1.0')
@ApiTags('QUALIFICATION')
export class QualificationController {
  constructor(
    private readonly fnQualificationIgnorantService: services.FnQualificationIgnorantService,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Throttle()
  @Patch('/course/:idCourse/teacher/:idTeacher/ignorant')
  @ApiCreatedResponse({
    description: 'The register ignorant has been successfully qualification.',
    type: response.ResponseGenericDto,
  })
  @ApiConflictResponse({
    description: 'The register ignorant has been successfully qualification.',
    type: null,
  })
  @ApiConflictResponse({
    description: 'The register ignorant has been failed qualification.',
    type: null,
  })
  @ApiInternalServerErrorResponse({
    description: 'The register ignorant has been failed by qualification.',
  })
  qualificationIfnorant(
   @Param('idCourse') idCourse: string,
   @Param('idTeacher') idTeacher: string,
   @UserDecorator() userDecorator: UserDecoratorInterface,
  ): Promise<response.ResponseGenericDto> {
    return this.fnQualificationIgnorantService.execute(idCourse, idTeacher, userDecorator);
  }

}
