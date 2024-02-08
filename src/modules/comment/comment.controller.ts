import { Controller, Body, UseGuards, Patch, Param } from '@nestjs/common';
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
@Controller('comment/v1.0')
@ApiTags('COMMENT')
export class CommentController {
  constructor(private readonly fnCommentService: services.FnCommentService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle()
  @Patch('/course/:idCourse/teacher/:idTeacher')
  @ApiCreatedResponse({
    description: 'The register has been successfully comment.',
    type: response.ResponseGenericDto,
  })
  @ApiConflictResponse({
    description: 'The register has been successfully comment.',
    type: null,
  })
  @ApiConflictResponse({
    description: 'The register has been failed comment.',
    type: null,
  })
  @ApiInternalServerErrorResponse({
    description: 'The register has been failed by comment.',
  })
  comment(
    @Param('idCourse') idCourse: string,
    @Param('idTeacher') idTeacher: string,
    @Body() requestCommentDto: request.RequestCommentDto,
    @UserDecorator() userDecorator: UserDecoratorInterface,
  ): Promise<response.ResponseGenericDto> {
    return this.fnCommentService.execute(
      idCourse,
      idTeacher,
      userDecorator,
      requestCommentDto.comment,
    );
  }
}
