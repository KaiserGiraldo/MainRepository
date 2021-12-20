var bypass = {};

bypass.init = function() {

  if (!crypto.subtle || JSON.parse(localStorage.noJsValidation || 'false')) {
    return;
  }

  api.convertButton('bypassFormButton', bypass.blockBypass, 'bypassField');

  bypass.creationButton = document.getElementById('bypassFormButton');
  bypass.originalCreationText = bypass.creationButton.innerHTML;

  bypass.validationButton = document.getElementById("validationButton");
  if (!bypass.validationButton) {
    return;
  }

  document.getElementById('noJs').remove();

  bypass.originalText = bypass.validationButton.innerHTML;

  bypass.validationButton.className = "";

  var callback = function(status, data) {

    if (status === 'ok') {
      document.getElementById("indicatorNotValidated").remove();
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  };

  callback.stop = function() {
    bypass.validationButton.innerHTML = bypass.originalText;
  };

  bypass.validationButton.onclick = function() {

    bypass.validationButton.innerHTML = "検証をお待ちください";

    bypassUtils.runValidation(callback);

    return false;

  };

};

bypass.addIndicator = function() {

  if (document.getElementById('indicatorValidBypass')) {

    if (document.getElementById("indicatorNotValidated")) {
      document.getElementById("indicatorNotValidated").remove();
    }

    return;
  }

  var paragraph = document.getElementById('settingsFieldset');

  var div = document.createElement('div');
  div.innerHTML = '有効なブロックバイパスがあります。';
  div.id = 'indicatorValidBypass';
  paragraph.insertBefore(div, paragraph.children[2]);

};

bypass.blockBypass = function() {

  var captchaField = document.getElementById('fieldCaptcha');

  var typedCaptcha = captchaField.value.trim();

  if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
    alert('CAPTCHAは6文字（クッキーがない場合は112文字）ちょうどの長さです。');
    return;
  }

  api.formApiRequest('renewBypass', {
    captcha : typedCaptcha
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      captchaUtils.reloadCaptcha();

      captchaField.value = '';

      if (api.getCookies().bypass.length <= 372) {

        bypass.addIndicator();
        return;

      }

      var callback = function(status, data) {

        if (status === 'ok') {
          bypass.addIndicator();
        } else {
          alert(status + ': ' + JSON.stringify(data));
        }

      };

      callback.stop = function() {
        bypass.creationButton.innerHTML = bypass.originalCreationText;
      };

      bypass.creationButton.innerHTML = "検証をお待ちください";

      bypassUtils.runValidation(callback);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

};

bypass.init();