var accountManagement = {};

accountManagement.init = function() {

  api.convertButton('deleteAccountFormButton', accountManagement.deleteAccount,
      'deleteAccountField');

};

accountManagement.deleteAccount = function() {

  var confirmed = document.getElementById('confirmationCheckbox').checked;

  if (!confirmed) {
    alert('このアカウントの削除を希望することを確認する必要があります。');
  } else {

    api.formApiRequest('deleteAccount', {
      confirmation : confirmed,
      account : document.getElementById('userIdentifier').value
    }, function requestComplete(status, data) {

      if (status === 'ok') {
        window.location = '/accounts.js';
      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

};

accountManagement.init();