import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';

import * as response from 'src/common/dto';
import * as request from './dto';
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
    private readonly fnQualificationService: services.FnQualificationService,
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
  qualificationIgnorant(
    @Param('idCourse') idCourse: string,
    @Param('idTeacher') idTeacher: string,
    @UserDecorator() userDecorator: UserDecoratorInterface,
  ): Promise<response.ResponseGenericDto> {
    return this.fnQualificationIgnorantService.execute(
      idCourse,
      idTeacher,
      userDecorator,
    );
  }

  @UseGuards(ThrottlerGuard)
  @Throttle()
  @Patch('/course/:idCourse/teacher/:idTeacher')
  @ApiCreatedResponse({
    description: 'The register has been successfully qualification.',
    type: response.ResponseGenericDto,
  })
  @ApiConflictResponse({
    description: 'The register has been successfully qualification.',
    type: null,
  })
  @ApiConflictResponse({
    description: 'The register has been failed qualification.',
    type: null,
  })
  @ApiInternalServerErrorResponse({
    description: 'The register has been failed by qualification.',
  })
  qualification(
    @Param('idCourse') idCourse: string,
    @Param('idTeacher') idTeacher: string,
    @Body() requestQualificationDto: request.RequestQualificationDto,
    @UserDecorator() userDecorator: UserDecoratorInterface,
  ): Promise<response.ResponseGenericDto> {
    return this.fnQualificationService.execute(
      idCourse,
      idTeacher,
      userDecorator,
      requestQualificationDto,
    );
  }
}
