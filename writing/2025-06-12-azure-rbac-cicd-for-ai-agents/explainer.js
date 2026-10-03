/* "Which credential answers?" for the Azure RBAC article.
   Mirrors DefaultAzureCredential in @azure/identity 4.10.0, the version in the
   project's package-lock.json: the chain order and the AZURE_TOKEN_CREDENTIALS
   dev/prod split from src/credentials/defaultAzureCredential.ts, the
   EnvironmentCredential checks from environmentCredential.ts, and the rule in
   chainedTokenCredential.ts that only an "unavailable" error moves on to the
   next credential; any other failure ends the chain. No real tokens are
   requested: each signal is a switch on this page. */
(function () {
  'use strict';

  var CHAIN = [
    { id: 'env', name: 'EnvironmentCredential', group: 'prod' },
    { id: 'wi', name: 'WorkloadIdentityCredential', group: 'prod' },
    { id: 'mi', name: 'ManagedIdentityCredential', group: 'prod' },
    { id: 'cli', name: 'AzureCliCredential', group: 'dev' },
    { id: 'ps', name: 'AzurePowerShellCredential', group: 'dev' },
    { id: 'azd', name: 'AzureDeveloperCliCredential', group: 'dev' }
  ];

  // s: { envVars, secretValid, fedFile, appService, azLogin, mode: '' | 'dev' | 'prod' }
  function resolve(s) {
    var order = CHAIN.filter(function (c) { return !s.mode || c.group === s.mode; });
    var steps = [];
    var outcome = null;
    for (var i = 0; i < order.length; i++) {
      var c = order[i];
      var r = attempt(c.id, s);
      steps.push({ id: c.id, state: r.state, msg: r.msg });
      if (r.state === 'token') { outcome = { ok: true, by: c.name }; break; }
      if (r.state === 'error') { outcome = { ok: false, msg: r.err, by: c.name }; break; }
    }
    if (!outcome) outcome = { ok: false, msg: 'ChainedTokenCredential authentication failed.', by: null };
    var tried = steps.map(function (x) { return x.id; });
    CHAIN.forEach(function (c) {
      if (tried.indexOf(c.id) === -1) {
        var excluded = s.mode && c.group !== s.mode;
        steps.push({ id: c.id, state: excluded ? 'excluded' : 'unreached', msg: excluded ? 'Left out: AZURE_TOKEN_CREDENTIALS=' + s.mode + '.' : '' });
      }
    });
    return { steps: steps, outcome: outcome };
  }

  function attempt(id, s) {
    switch (id) {
      case 'env':
        if (s.envVars) {
          return s.secretValid
            ? { state: 'token', msg: 'AZURE_TENANT_ID, AZURE_CLIENT_ID and AZURE_CLIENT_SECRET are set, so it signs in as that service principal.' }
            : { state: 'error', err: 'EnvironmentCredential authentication failed.', msg: 'The secret is set but rejected (expired or wrong). This is an authentication error, not "unavailable", so the chain ends here.' };
        }
        return { state: 'unavailable', msg: 'EnvironmentCredential is unavailable. No underlying credential could be used.' };
      case 'wi':
        return s.fedFile
          ? { state: 'token', msg: 'AZURE_FEDERATED_TOKEN_FILE is set, so it trades that file for a token.' }
          : { state: 'unavailable', msg: 'Unavailable: no AZURE_FEDERATED_TOKEN_FILE.' };
      case 'mi':
        return s.appService
          ? { state: 'token', msg: 'App Service set IDENTITY_ENDPOINT and IDENTITY_HEADER, so it asks the local token endpoint for the app\'s own identity.' }
          : { state: 'unavailable', msg: 'Unavailable: no managed identity endpoint here.' };
      case 'cli':
        return s.azLogin
          ? { state: 'token', msg: 'Runs az account get-access-token as whoever ran az login.' }
          : { state: 'unavailable', msg: 'Please run \'az login\' from a command prompt to authenticate before using this credential.' };
      default:
        return { state: 'unavailable', msg: 'Unavailable: not signed in on this page.' };
    }
  }

  window.CredentialChain = { resolve: resolve };

  var root = document.querySelector('[data-chain-lab]');
  if (!root) return;
  var PRESETS = {
    laptop: { envVars: false, secretValid: true, fedFile: false, appService: false, azLogin: true, mode: '' },
    webapp: { envVars: false, secretValid: true, fedFile: false, appService: true, azLogin: false, mode: '' },
    codex: { envVars: true, secretValid: true, fedFile: false, appService: false, azLogin: false, mode: '' },
    expired: { envVars: true, secretValid: false, fedFile: false, appService: false, azLogin: false, mode: '' },
    mixed: { envVars: true, secretValid: true, fedFile: false, appService: false, azLogin: true, mode: '' },
    dev: { envVars: true, secretValid: true, fedFile: false, appService: false, azLogin: true, mode: 'dev' }
  };
  var chips = root.querySelector('.chips');
  var presetButtons = Array.prototype.slice.call(chips.querySelectorAll('button'));
  var controls = root.querySelector('[data-controls]');
  var inputs = {};
  controls.querySelectorAll('[data-k]').forEach(function (el) { inputs[el.dataset.k] = el; });
  var rows = {};
  root.querySelectorAll('[data-c]').forEach(function (li) { rows[li.dataset.c] = li; });
  var result = root.querySelector('[data-result]');

  chips.hidden = false;
  controls.hidden = false;
  root.classList.add('is-live');

  function read() {
    return {
      envVars: inputs.envVars.checked,
      secretValid: inputs.secretValid.checked,
      fedFile: inputs.fedFile.checked,
      appService: inputs.appService.checked,
      azLogin: inputs.azLogin.checked,
      mode: inputs.mode.value
    };
  }

  function write(s) {
    Object.keys(s).forEach(function (k) {
      if (k === 'mode') inputs.mode.value = s.mode;
      else inputs[k].checked = s[k];
    });
  }

  var LABEL = { token: 'token', error: 'stops here', unavailable: 'unavailable', unreached: 'not tried', excluded: 'left out' };

  function render() {
    var s = read();
    inputs.secretValid.disabled = !s.envVars;
    var r = resolve(s);
    r.steps.forEach(function (st) {
      var li = rows[st.id];
      li.dataset.state = st.state;
      li.querySelector('.cc__state').textContent = LABEL[st.state];
      li.querySelector('.cc__msg').textContent = st.msg;
    });
    result.dataset.ok = r.outcome.ok ? 'yes' : 'no';
    result.textContent = r.outcome.ok
      ? 'getToken() succeeds through ' + r.outcome.by + '.'
      : 'getToken() throws: ' + r.outcome.msg;
  }

  function pick(id) {
    presetButtons.forEach(function (b) { b.setAttribute('aria-checked', b.dataset.preset === id ? 'true' : 'false'); });
    write(PRESETS[id]);
    render();
  }

  presetButtons.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.preset); }); });
  controls.addEventListener('change', function () {
    presetButtons.forEach(function (b) { b.setAttribute('aria-checked', 'false'); });
    render();
  });
  pick('laptop');
})();
