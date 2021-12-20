var loginObj = {};
// I wish I could go back in time and kill whoever implemented the exposed
// element bullshit on IE before he was born

loginObj.init = function() {

  if (document.getElementById('divCreation')) {
    api.convertButton('registerFormButton', loginObj.registerAccount,
        'registerField');
  }

  api.convertButton('recoverFormButton', loginObj.recoverAccount,
      'recoverField');
  api.convertButton('loginFormButton', loginObj.loginUser, 'loginField');

};

loginObj.recoverAccount = function() {

  var typedLogin = document.getElementById('recoverFieldLogin').value.trim();
  var typedCaptcha = document.getElementById('fieldCaptchaRecover').value
      .trim();

  if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
    alert('CAPTCHAは6文字（クッキーがない場合は112文字）ちょうどの長さです。');

  } else if (typedLogin.length) {

    api.formApiRequest('requestAccountRecovery', {
      login : typedLogin,
      captcha : typedCaptcha
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('パスワードのリクエストを作成しました。メールを確認してください。');

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

};

loginObj.loginUser = function() {

  var typedLogin = document.getElementById('loginFieldLogin').value.trim();
  var typedPassword = document.getElementById('loginFieldPassword').value;

  if (!typedLogin.length || !typedPassword.length) {
    alert('ログインとパスワードの両方が必須です。');
  } else {

    var redirect = api.getCookies().loginredirect || '/account.js';

    api.formApiRequest('login', {
      login : typedLogin,
      password : typedPassword,
      remember : document.getElementById('checkboxRemember').checked
    }, function requestComplete(status, data) {

      if (status === 'ok') {
        window.location.href = redirect;
      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  }

};

loginObj.registerAccount = function() {

  var typedLogin = document.getElementById('registerFieldLogin').value.trim();
  var typedEmail = document.getElementById('registerFieldEmail').value.trim();
  var typedPassword = document.getElementById('registerFieldPassword').value;
  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();

  if (!typedLogin.length || !typedPassword.length) {
    alert('ログインとパスワードの両方が必須です。');
  } else if (typedLogin.length > 16) {
    alert('ログインが長すぎるため、16文字以下にしてください。');
  } else if (typedEmail.length > 64) {
    alert('電子メールは長すぎるため、64文字以内に収めてください。');
  } else if (typedCaptcha.length !== 6 && typedCaptcha.length !== 112) {
    alert('CAPTCHAは6文字（クッキーがない場合は112文字）ちょうどの長さです。');
    return;
  } else if (/\W/.test(typedLogin)) {
    alert('ログインが無効です。');
  } else {

    api.formApiRequest('registerAccount', {
      login : typedLogin,
      captcha : typedCaptcha,
      password : typedPassword,
      email : typedEmail
    }, function requestComplete(status, data) {

      if (status === 'ok') {
        window.location.pathname = '/account.js';
      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

};

loginObj.init();