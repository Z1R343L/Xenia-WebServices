import { Inject } from '@nestjs/common';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { AggregateSessionCommand } from '../commands/AggregateSessionCommand';
import ISessionRepository, {
  ISessionRepositorySymbol,
} from 'src/domain/repositories/ISessionRepository';
import axios, { AxiosRequestConfig } from 'axios';

const icon_cache = new Map<string, string>();
const title_info_cache = new Map<string, object>();

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
      timeout: 300,
    };

    await axios
      .request(config)
      .then((response) => {
        data = response.data;
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

      if (!icon_cache.has(titleId)) {
        const icon_base64 = await this.downloadImageAsBase64(
          `http://xboxunity.net/Resources/Lib/Icon.php?tid=${titleId}`,
        );

        // Don't cache empty response
        if (icon_base64) {
          // Don't cache placeholder icon
          if (
            !icon_base64.startsWith(
              'GXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw',
              70,
            )
          ) {
            icon_cache.set(titleId, icon_base64);
          }
        }
      }

      // will return empty object if title not found.
      const title_info = await this.downloadContent(
        `http://xboxunity.net/Resources/Lib/Title.php?tid=${titleId}`,
        'json',
      );

      if (!title_info_cache.has(titleId) && title_info) {
        // Check if returned object was empty.
        if (title_info.TitleID) {
          title_info_cache.set(titleId, title_info);
        }
      }

      let index = titles['Titles'].findIndex(
        (title) => title.titleId == titleId,
      );

      if (index == -1) {
        const data = {
          titleId: titleId,
          name: session.title,
          icon: icon_cache.get(titleId),
          info: title_info_cache.get(titleId),
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

    console.log(`Icon Cache Size: ${icon_cache.size}`);
    console.log(`Title Info Cache Size: ${title_info_cache.size}`);

    return JSON.stringify(titles);
  }
}
