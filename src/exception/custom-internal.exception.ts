import { InternalServerErrorException } from '@nestjs/common';

export class DeleteTokenInSecurityException extends InternalServerErrorException {
  constructor() {
    super(`${DeleteTokenInSecurityException.name}`);
  }
}
