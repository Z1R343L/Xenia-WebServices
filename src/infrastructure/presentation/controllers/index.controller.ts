import { Controller, Inject, Get, Header, Res } from '@nestjs/common';
import ILogger, { ILoggerSymbol } from '../../../ILogger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AggregateSessionCommand } from 'src/application/commands/AggregateSessionCommand';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class IndexController {
  constructor(
    @Inject(ILoggerSymbol) private readonly logger: ILogger,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/')
  @Header('content-type', 'text/html')
  async index(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../../../', 'public/index.html'));
  }

  @Get('/sessions')
  @Header('content-type', 'application/json')
  async sessionData() {
    const sessionsJSON = await this.commandBus.execute(
      new AggregateSessionCommand(),
    );

    return sessionsJSON;
  }
}
