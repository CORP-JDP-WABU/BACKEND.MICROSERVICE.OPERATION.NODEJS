import { DynamicModule, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ClientProxy, ClientTCP, Closeable } from '@nestjs/microservices';

import {
  ClientProviderOptions,
  ClientsModuleOptionsFactory,
  ClientsProviderAsyncOptions
} from './interfaces';
import { SecurityService } from './security.service';
import { CLIENT } from 'src/common/const/comon.const';

@Module({})
export class SecurityModule {
  static register(clientOptions: ClientProviderOptions): DynamicModule {
    const client = {
      provide: CLIENT.SECURITY,
      useValue: this.assignOnAppShutdownHook(new ClientTCP(clientOptions))
    };
    return {
      global: clientOptions.glogal,
      module: SecurityModule,
      providers: [client, SecurityService],
      exports: [SecurityService]
    };
  }

  static registerAsync(option: ClientsProviderAsyncOptions): DynamicModule {
    return {
      global: option.global,
      module: SecurityModule,
      imports: option.imports,
      providers: [
        ...this.createAsyncProviders(option).concat(option.extraProviders || []),
        SecurityService
      ],
      exports: [SecurityService]
    };
  }

  private static createAsyncProviders(options: ClientsProviderAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass
      }
    ];
  }

  private static createAsyncOptionsProvider(options: ClientsProviderAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: CLIENT.SECURITY,
        useFactory: this.createFactoryWrapper(options.useFactory),
        inject: options.inject || []
      };
    }
    return {
      provide: CLIENT.SECURITY,
      useFactory: this.createFactoryWrapper((optionsFactory: ClientsModuleOptionsFactory) =>
        optionsFactory.createClientOptions()
      ),
      inject: [options.useExisting || options.useClass]
    };
  }

  private static createFactoryWrapper(useFactory: ClientsProviderAsyncOptions['useFactory']) {
    return async (...args: any[]) => {
      const clientOptions = await useFactory(...args);
      const clientProxyRef = new ClientTCP(clientOptions);
      return this.assignOnAppShutdownHook(clientProxyRef);
    };
  }

  private static assignOnAppShutdownHook(client: ClientProxy & Closeable): ClientProxy & Closeable {
    (client as unknown as OnApplicationShutdown).onApplicationShutdown = client.close;
    return client;
  }
}
