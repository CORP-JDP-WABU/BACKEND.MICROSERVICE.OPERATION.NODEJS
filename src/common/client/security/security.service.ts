import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientTCP } from '@nestjs/microservices';
import { CLIENT } from 'src/common/const/comon.const';

@Injectable()
export class SecurityService {
  private logger = new Logger(`::${CLIENT.SECURITY}::${SecurityService.name}`);
  constructor(
    @Inject(CLIENT.SECURITY)
    private readonly client: ClientTCP
  ) {}

  callFxValidateToken<TResult = any, TInput = any>(dto: TInput): Promise<TResult> {
    /*this.logger.debug(
      `execute::callFxValidateToken::params${JSON.stringify(dto)}`,
    );*/
    const pattern = { subjet: 'client-security', function: 'validate-token' };
    return this.client.send<TResult, TInput>(pattern, dto).toPromise();
  }

  callFxConfigStudent<TResult = any, TInput = any>(dto: TInput): Promise<TResult> {
    /*this.logger.debug(
      `execute::callFxConfigStudent::params${JSON.stringify(dto)}`,
    );*/
    const pattern = { subjet: 'client-security', function: 'config-student' };
    return this.client.send<TResult, TInput>(pattern, dto).toPromise();
  }
}
