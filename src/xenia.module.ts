import { Module, Global, ConsoleLogger } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { DomainModule } from './domain/domain.module';
import { ILoggerSymbol } from './ILogger';
import { PersistanceModule } from './infrastructure/persistance/persistance.module';
import { PresentationModule } from './infrastructure/presentation/presentation.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ApplicationModule,
    DomainModule,
    PersistanceModule,
    PresentationModule,
    ServeStaticModule.forRoot({
      serveRoot: '/',
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [],
  providers: [{ provide: ILoggerSymbol, useClass: ConsoleLogger }],
  exports: [ILoggerSymbol],
})
export class XeniaModule {}
