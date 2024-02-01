import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpCustomException implements ExceptionFilter {
  private readonly className = HttpCustomException.name;

  constructor(private logger: Logger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const { statusCode, message }: any = exception.getResponse();

    if (
      (statusCode || status) < HttpStatus.INTERNAL_SERVER_ERROR &&
      (statusCode || status) >= HttpStatus.BAD_REQUEST
    ) {
      this.logger.warn(
        `::${this.className}::${exception.name}::${statusCode || status}::${
          message || exception.getResponse()
        }::`,
      );
    }
    response.status(status);

    switch (statusCode) {
      case HttpStatus.NO_CONTENT:
      case HttpStatus.UNAUTHORIZED:
        response.send();
        return response;
      case HttpStatus.BAD_REQUEST:
        return response.send({
          statusCode,
          rules: message,
        });
      case HttpStatus.CONFLICT:
        const customMessage = message.split(' [')[0];
        return response.send({
          statusCode,
          message: customMessage,
        });
      default:
        return response.send({
          statusCode: statusCode || status,
          message: 'Ocurrio un error inesperado, vuelva a intentar el proceso',
          code: message,
        });
    }
  }
}
