import { Inject } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AggregateSessionCommand } from '../commands/AggregateSessionCommand';
import ISessionRepository, {
  ISessionRepositorySymbol,
} from 'src/domain/repositories/ISessionRepository';
import axios, { AxiosRequestConfig } from 'axios';

@CommandHandler(AggregateSessionCommand)
export class AggregateSessionCommandHandler
  implements ICommandHandler<AggregateSessionCommand>
{
  constructor(
    @Inject(ISessionRepositorySymbol)
    private repository: ISessionRepository,
  ) {}

  async downloadImageAsBase64(url: string): Promise<string> {
    const response = await this.downloadContent(url, 'arraybuffer');

    if (response) {
      const base64 = Buffer.from(response, 'binary').toString('base64');
      return `data:image/png;base64,${base64}`;
    }

    return '';
  }

  async downloadContent(url: string, type: any): Promise<any> {
    let data = undefined;

    const config: AxiosRequestConfig = {
      url: url,
      responseType: type,
    };

    await axios
      .get(url, config)
      .then((response) => {
        data = response.data;
        console.log('Request Success');
      })
      .catch(function (error) {
        if (error.response) {
          console.log(`Failed ${url}`);
        } else if (error.request) {
          console.log(`Failed ${url}`);
        } else {
          console.log(`Failed ${url}`);
        }
      });

    return data;
  }

  async execute() {
    const sessions = await this.repository.findAllAdvertisedSessions();

    const titles = {};

    titles['Titles'] = [];

    for (const session of sessions) {
      const titleId = session.titleId.toString();

      let index = titles['Titles'].findIndex(
        (title) => title.titleId === titleId,
      );

      // will return object if title not found.
      const icon_base64 = await this.downloadImageAsBase64(
        `http://xboxunity.net/Resources/Lib/Icon.php?tid=${titleId}`,
      );

      const title_info = await this.downloadContent(
        `http://xboxunity.net/Resources/Lib/Title.php?tid=${titleId}`,
        'json',
      );

      if (index == -1) {
        const data = {
          titleId: titleId,
          name: session.title,
          icon: icon_base64,
          info: title_info,
          sessions: [],
        };

        titles['Titles'].push(data);

        index = titles['Titles'].length - 1;
      }

      const data = {
        mediaId: session.mediaId,
        version: session.version,
        players: session.players.length,
      };

      titles['Titles'][index]['sessions'].push(data);
    }

    return JSON.stringify(titles);
  }
}
