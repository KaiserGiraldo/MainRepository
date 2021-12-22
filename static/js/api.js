var api = {};

api.mobile = window.innerWidth < 812;

api.padDateField = function(value) {

  if (value < 10) {
    value = '0' + value;
  }

  return value;

};

api.formatDateToDisplay = function(d, local) {

  var day = api.padDateField(d[local ? 'getDate' : 'getJSTDate']());

  var weekDays = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

  var month = api.padDateField(d[local ? 'getMonth' : 'getJSTMonth']() + 1);

  var year = d[local ? 'getFullYear' : 'getJSTFullYear']();

  var weekDay = weekDays[d[local ? 'getDay' : 'getJSTDay']()];

  var hour = api.padDateField(d[local ? 'getHours' : 'getJSTHours']());

  var minute = api.padDateField(d[local ? 'getMinutes' : 'getJSTMinutes']());

  var second = api.padDateField(d.getJSTSeconds());

  var toReturn = month + '/' + day + '/' + year;

  return toReturn + ' (' + weekDay + ') ' + hour + ':' + minute + ':' + second;

};

api.htmlReplaceTable = {
  '<' : '&lt;',
  '>' : '&gt;',
  '\"' : '&quot;',
  '\'' : '&apos;'
};

api.removeIndicator = function(className, thread) {

  var elements = (thread || document).getElementsByClassName(className);

  if (!elements.length) {
    return;
  }

  elements[0].nextSibling.remove();
  elements[0].remove();

};

api.addIndicator = function(className, title, thread) {

  var spanId = (thread || document).getElementsByClassName('spanId')[0];

  if (!spanId) {
    spanId = (thread || document).getElementsByClassName('labelCreated')[0];
  }

  var indicator = document.createElement('span');
  indicator.className = className;
  indicator.title = title;

  spanId.parentNode.insertBefore(indicator, spanId.nextSibling);
  spanId.parentNode.insertBefore(document.createTextNode(' '),
      spanId.nextSibling);

};

api.resetIndicators = function(data, thread) {

  api.removeIndicator('lockIndicator', thread);
  api.removeIndicator('pinIndicator', thread);
  api.removeIndicator('cyclicIndicator', thread);
  api.removeIndicator('archiveIndicator', thread);

  api.addIndicator('cyclicIndicator', '循環スレッド', thread);
  api.addIndicator('pinIndicator', '粘着性', thread);
  api.addIndicator('lockIndicator', 'ロックされた', thread);
  api.addIndicator('archiveIndicator', 'Archived', thread);

  if (!data.locked) {
    api.removeIndicator('lockIndicator', thread);
  }

  if (!data.pinned) {
    api.removeIndicator('pinIndicator', thread);
  }

  if (!data.cyclic) {
    api.removeIndicator('cyclicIndicator', thread);
  }

  if (!data.archived) {
    api.removeIndicator('archiveIndicator', thread);
  }

};

api.addEnterEvent = function(element, onclick) {

  element.addEventListener('keydown', function(event) {

    if (event.key === 'Enter') {
      onclick();
      event.preventDefault();
    }

  });

};

api.convertButton = function(button, onclick, inputs) {

  if (typeof (button) === 'string') {
    button = document.getElementById(button);
  }

  button.type = 'button';
  button.onclick = onclick;

  if (!inputs) {
    return;
  }

  inputs = document.getElementsByClassName(inputs);

  for (var i = 0; i < inputs.length; i++) {
    api.addEnterEvent(inputs[i], onclick);
  }

};

api.getCookies = function() {

  var parsedCookies = {};

  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {

    var cookie = cookies[i];

    var parts = cookie.split('=');
    parsedCookies[parts.shift().trim()] = decodeURI(parts.join('='));

  }

  return parsedCookies;

};

api.handleConnectionResponse = function(xhr, callback, silent) {

  var response;

  try {
    response = JSON.parse(xhr.responseText);
  } catch (error) {
    if (!silent) {
      alert('レスポンスの解析にエラーが発生しました。');
    }
    return;
  }

  if (response.status === 'error') {

    if (!silent) {
      alert(response.data);
    }

  } else if (response.status === 'hashBan') {

    var desc = '';

    var bans = response.data;

    for (var i = 0; i < bans.length; i++) {
      var ban = bans[i];

      if (i) {
        desc += '\n';
      }

      desc += 'ファイル' + ban.file + 'は、 から禁止されています。'
          + (ban.boardUri ? '/' + ban.boardUri + '/' : 'すべての板。');

      if (ban.reason) {
        desc += ' 理由：' + ban.reason + '.';
      }

    }

    alert(desc);
  } else if (response.status === 'bypassable') {

    postCommon.displayBlockBypassPrompt(function() {
      alert('投稿できるようになりました。');
    });

  } else if (response.status === 'maintenance') {

    if (!silent) {
      alert('現在、サイトのメンテナンスを行っており、一時的にすべての機能が使えなくなっています。');
    }

  } else if (response.status === 'banned') {

    var message;

    if (response.data.range) {
      message = 'あなたのIP範囲' + response.data.range
          + 'は、から禁止されています' + response.data.board + '。';
    } else if (response.data.asn) {
      message = 'あなたのASN' + response.data.asn + 'からのアクセスが禁止されました'
          + response.data.board + '。';
    } else if (response.data.warning) {
      message = 'あなたは' + response.data.board + 'で警告されました。';
    } else {
      message = 'あなたは' + response.data.board + 'から追放されました。';
    }

    if (response.data.reason) {
      message += '\n理由："' + response.data.reason + '"。';
    }

    if (response.data.warning) {
      return alert(message);
    }

    if (response.data.expiration) {

      message += '\nこの禁止事項は'
          + new Date(response.data.expiration).toString() + 'に期限切れとなります。';

    } else {
      message += '\nこの禁止令に期限はありません。'
    }

    message += '\nあなたの禁止ID：' + response.data.banId + '。';

    if (!response.data.appealled) {
      message += '\nこの禁止令に対して、あなたは異議を申し立てることができます。';

      var appeal = prompt(message, 'アピール文を書く');

      if (appeal) {

        api.formApiRequest('appealBan', {
          appeal : appeal,
          banId : response.data.banId
        }, function appealed(status, data) {

          if (status !== 'ok') {
            alert(data);
          } else {
            alert('禁止事項をアピール');
          }

        });

      }

    } else {
      alert(message);
    }

  } else {
    callback(response.status, response.data);
  }

};

api.formApiRequest = function(page, parameters, callback, silent, getParameters) {

  var silent;

  page += '.js?json=1';

  getParameters = getParameters || {};

  for ( var parameter in getParameters) {
    page += '&' + parameter + '='
        + encodeURIComponent(getParameters[parameter]);
  }

  var xhr = new XMLHttpRequest();

  if ('withCredentials' in xhr) {
    xhr.open('POST', '/' + page, true);
  } else if (typeof XDomainRequest != 'undefined') {

    xhr = new XDomainRequest();
    xhr.open('POST', '/' + page);
  } else {
    alert('ブラウザをアップデートするか、javascriptをオフにしてください。');

    return;
  }

  if (callback.hasOwnProperty('progress')) {
    xhr.upload.onprogress = callback.progress;
  }

  xhr.onreadystatechange = function connectionStateChanged() {

    if (xhr.readyState !== 4) {
      return;
    }

    if (parameters.captcha) {
      captchaUtils.reloadCaptcha();
    }

    if (callback.hasOwnProperty('stop')) {
      callback.stop();
    }

    if (xhr.status != 200) {
      if (!silent) {
        alert('接続に失敗しました。');
      }

      return;
    }

    api.handleConnectionResponse(xhr, callback, silent);

  };

  var form = new FormData();

  for ( var entry in parameters) {

    if (!parameters[entry] && typeof (parameters[entry] !== 'number')) {
      continue;
    }

    if (entry !== 'files') {

      if (Array.isArray(parameters[entry])) {

        var values = parameters[entry];

        for (var i = 0; i < values.length; i++) {
          form.append(entry, values[i]);
        }

      } else {
        form.append(entry, parameters[entry]);
      }

    } else {

      var files = parameters.files;

      for (var i = 0; i < files.length; i++) {

        var file = files[i];

        if (file.sha256) {
          form.append('fileSha256', file.sha256);
          form.append('fileMime', file.mime);
          form.append('fileSpoiler', file.spoiler || '');
          form.append('fileName', file.name);
        }

        if (file.content) {
          form.append('files', file.content, file.name);
        }

      }

    }

  }

  xhr.send(form);

};

api.localRequest = function(address, callback) {

  var xhr = new XMLHttpRequest();

  if ('withCredentials' in xhr) {
    xhr.open('GET', address, true);
  } else if (typeof XDomainRequest != 'undefined') {

    xhr = new XDomainRequest();
    xhr.open('GET', address);
  } else {
    alert('ブラウザをアップデートするか、javascriptをオフにしてください。');
    return;
  }

  xhr.onreadystatechange = function connectionStateChanged() {

    if (xhr.readyState == 4) {

      if (callback.hasOwnProperty('stop')) {
        callback.stop();
      }

      if (xhr.status != 200) {
        callback('接続に失敗しました。');
      } else {
        callback(null, xhr.responseText);
      }

    }
  };

  xhr.send();

};
