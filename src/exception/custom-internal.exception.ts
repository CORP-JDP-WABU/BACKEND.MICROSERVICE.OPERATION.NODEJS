import { InternalServerErrorException } from '@nestjs/common';

export class InserDocumentException extends InternalServerErrorException {
  constructor() {
    super(`${InserDocumentException.name}`);
  }
}

export class GenerateS3RouterException extends InternalServerErrorException {
  constructor() {
    super(`${GenerateS3RouterException.name}`);
  }
}

export class UploadDocumentS3Exception extends InternalServerErrorException {
  constructor() {
    super(`${UploadDocumentS3Exception.name}`);
  }
}

export class UpdateProfileCourseException extends InternalServerErrorException {
  constructor() {
    super(`${UpdateProfileCourseException.name}`);
  }
}

export class FindPaginationDocumentsException extends InternalServerErrorException {
  constructor() {
    super(`${FindPaginationDocumentsException.name}`);
  }
}

export class FindDocumentsException extends InternalServerErrorException {
  constructor() {
    super(`${FindDocumentsException.name}`);
  }
}
