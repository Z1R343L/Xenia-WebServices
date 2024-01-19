function generateSessionsTable(sessionsData) {
  let result = '';

  result += '<table>\n';

  result += `<tr>\n`;
  result += `<th>Title</th>\n`;
  result += `<th>Players</th>\n`;
  result += `<th id="title_update">Latest TU</th>\n`;
  result += `</tr>\n`;

  sessionsData?.Titles?.forEach((titleInfo) => {
    let title = 'N/A';

    if (titleInfo?.info?.TitleID) {
      title = titleInfo.info.Name;
    } else if (titleInfo?.name) {
      title = titleInfo.name;
    }

    for (const session of titleInfo?.sessions) {
      let Version_Text = session.version ? session.version : 'N/A';
      let MediaID_Text =
        session.mediaId && session.mediaId != 0 ? session.mediaId : 'N/A';

      let TU_Text = 'N/A';
      let TU_download_url = '#';

      if (titleInfo.info?.TitleID && session.mediaId) {
        const Title_Update = GetLatestTU(titleInfo.info, session.mediaId);

        if (Title_Update) {
          TU_download_url = `http://xboxunity.net/Resources/Lib/TitleUpdate.php?tuid=${Title_Update.TitleUpdateID}`;
          TU_Text = `TU: ${Title_Update.Version}`;
        }
      }

      const icon_asset = titleInfo.icon ? titleInfo.icon : 'assets/icon.png';
      const icon = `<div class="image"><img src="${icon_asset}" width="64" height="64" onerror="this.src='assets/icon.png';"></div>`;

      result += `<tr>\n`;
      result += `<td>
              <div class="container">
                  ${icon}
                  <div class="text">
                      <div>${title}</div>
                      <div style="margin-top: 15px;font-size: 14px;">Title ID: ${titleInfo.titleId}</div>
                      <div style="margin-top: 4px;font-size: 14px;">Media ID: ${MediaID_Text}</div>
                      <div style="margin-top: 4px;font-size: 14px;">Version: ${Version_Text}</div>
                  </div>
              </div>
          </td>\n`;
      result += `<td>${session.players}</td>\n`;
      result += `<td id="title_update"><a href="${TU_download_url}">${TU_Text}</a></td>\n`;
      result += `</tr>\n`;
    }
  });

  result += '</table>\n';

  return result;
}

function GetLatestTU(titleInfo, mediaId) {
  let latestTU;

  if (mediaId == 0) {
    return latestTU;
  }

  titleInfo?.MediaIds.forEach((media) => {
    if (media.MediaID == mediaId) {
      const lastIndex = media['Updates'].length - 1;
      latestTU = media['Updates'][lastIndex];
    }
  });

  return latestTU;
}

function HttpGet(url) {
  const xmlHttp = new XMLHttpRequest();

  try {
    xmlHttp.open('GET', url, false); // Synchronous Request
    xmlHttp.send();
  } catch (err) {
    return xmlHttp;
  }

  return xmlHttp;
}

function refreshSessionTable() {
  let sessionData = {};

  const response = HttpGet(window.origin + '/sessions');

  if (response.status == 304 || response.status == 200) {
    sessionData = JSON.parse(response.responseText);
  }

  document.getElementById('sessions').innerHTML =
    generateSessionsTable(sessionData);
}

let time = 60;

function refreshTimer() {
  if (time <= 0) {
    time = 60;
    refreshSessionTable();
  }

  document.getElementById('countdown').innerHTML =
    'Refreshing in ' + time + 's';

  time -= 1;
}

function setIntervalImmediately(func, interval) {
  func();
  return setInterval(func, interval);
}

setIntervalImmediately(refreshTimer, 1000);

refreshSessionTable();
