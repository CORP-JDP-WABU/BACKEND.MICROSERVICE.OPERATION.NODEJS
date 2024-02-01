import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get('healthcheck')
  getStatusHealthCheck(): Record<string, string> {
    const response = {
      mongodb: this.connection.readyState === 1 ? 'ready' : 'connecting',
    };

    if (Object.values(response).find((status) => status === 'connecting')) {
      throw new InternalServerErrorException(response);
    }

    return response;
  }
}
