var accounts = {};

accounts.init = function() {

  accounts.divAccounts = document.getElementById('divAccounts');

  api.convertButton('addAccountFormButton', accounts.addAccount,
      'addAccountField');

};

accounts.addAccount = function() {

  var typedLogin = document.getElementById('fieldLogin').value.trim();
  var typedPassword = document.getElementById('fieldPassword').value;
  var typedEmail = document.getElementById('fieldEmail').value;

  if (!typedLogin.length || !typedPassword.length) {
    alert('ログインとパスワードの両方が必須です。');
  } else if (typedLogin.length > 16) {
    alert('ログインが長すぎるため、16文字以下にしてください。');
  } else if (/\W/.test(typedLogin)) {
    alert('ログインが無効です。');
  } else {

    api.formApiRequest('addAccount', {
      login : typedLogin,
      password : typedPassword,
      email : typedEmail
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        var newLink = document.createElement('a');
        newLink.innerHTML = typedLogin;
        newLink.href = '/accountManagement.js?account=' + typedLogin;
        accounts.divAccounts.appendChild(newLink);

        document.getElementById('fieldLogin').value = '';
        document.getElementById('fieldPassword').value = '';
        document.getElementById('fieldEmail').value = '';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

};

accounts.init();