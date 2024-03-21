import {
  Controller,
  Param,
  UseInterceptors,
  Post,
  Query,
  Body,
  UploadedFiles,
  UseGuards,
  Get
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';

import * as response from 'src/common/dto';
import * as request from './dto';
import * as services from './services';
import * as enums from 'src/common/enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SecurityGuard } from 'src/common/guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserDecorator } from 'src/common/decorator';
import { UserDecoratorInterface } from 'src/common/interfaces';

@Controller('document/v1.0')
@ApiTags('DOCUMENT')
export class DocumentController {
  constructor(
    private readonly fnFindDocumentService: services.FnFindDocumentService,
    private readonly fnUploadDocumentService: services.FnUploadDocumentService  
  ) {}

  @ApiBearerAuth()
  @UseGuards(SecurityGuard, ThrottlerGuard)
  @Post('/upload/university/:idUniversity/course/:idCourse')
  @ApiQuery({
    name: 'documentType',
    enum: enums.DocumentTypeEnum,
    enumName: 'enums.DocumentTypeEnum',
    required: true
  })
  @ApiQuery({
    name: 'idTeacher',
    required: false
  })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiCreatedResponse({
    description: 'The upload document has been successfully qualification.',
    type: response.ResponseGenericDto
  })
  @ApiConflictResponse({
    description: 'The upload document has been successfully qualification.',
    type: null
  })
  @ApiConflictResponse({
    description: 'The upload document has been failed qualification.',
    type: null
  })
  @ApiInternalServerErrorResponse({
    description: 'The register ignorant has been failed by qualification.'
  })
  upload(
    @Param('idUniversity') idUniversity: string,
    @Param('idCourse') idCourse: string,
    @Query('documentType') documentType: enums.DocumentTypeEnum,
    @Query('idTeacher') idTeacher: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDocumentDto: request.RequestUploadDocumentDto,
    @UserDecorator() userDecorator: UserDecoratorInterface
  ): Promise<response.ResponseGenericDto> {
    return this.fnUploadDocumentService.execute(
      idUniversity,
      idCourse,
      idTeacher,
      files,
      documentType,
      uploadDocumentDto.cicleName,
      userDecorator,
    );
  }

  @Get('/upload/university/:idUniversity/course/:idCourse/:skipe')
  @ApiCreatedResponse({
    description: 'The upload document has been successfully qualification.',
    type: response.ResponseGenericDto
  })
  @ApiConflictResponse({
    description: 'The upload document has been successfully qualification.',
    type: null
  })
  @ApiConflictResponse({
    description: 'The upload document has been failed qualification.',
    type: null
  })
  @ApiInternalServerErrorResponse({
    description: 'The register ignorant has been failed by qualification.'
  })
  findAllWithPagination(
    @Param('idUniversity') idUniversity: string,
    @Param('idCourse') idCourse: string,
    @Param('skipe') skipe: string,
    @Query('search') search: string,
  ) {
    return this.fnFindDocumentService.execute(
      idUniversity,
      idCourse,
      parseInt(skipe),
      search
    );
  }

}
