'use strict';
// Standalone UX mock. No production imports, network, storage, permission requests or device actions.
// Settings forms illustrate controls only; they do not implement policy inheritance or cross-page configuration.
const $ = (id) => document.getElementById(id);
const pages = [...document.querySelectorAll('.page')];
const apps = [
  { name: '纸笺', package: 'com.example.paper', icon: '✉', system: false },
  { name: '晴天', package: 'com.example.weather', icon: '☁', system: false },
  { name: '纸笺', package: 'org.example.paper.work', icon: '▤', system: false },
  { name: '系统提醒', package: 'com.example.system.reminders', icon: '◇', system: true },
];
let savedApps = new Set([apps[0].package, apps[1].package]);
// Previously configured fictional phone; this is not the first-run default.
let savedRecipients = new Set(['work']);
let currentPage = 'a-sync';
let scenario = 'ready';
let previousPolicyApp = '0';
const dirtyForms = new Set();
const feedback = (message) => { $('demo-feedback').textContent = `原型演示：${message}`; };
const selectedValues = (selector) => new Set([...document.querySelectorAll(selector)].filter((input) => input.checked).map((input) => input.value));
const selectionDirty = (selector, saved) => {
  const selected = selectedValues(selector);
  return selected.size !== saved.size || [...selected].some((value) => !saved.has(value));
};
function discardDrafts() {
  if (!selectionDirty('.app-choice input', savedApps) && !selectionDirty('.recipient-choice', savedRecipients) && dirtyForms.size === 0) return true;
  if (!window.confirm('有未保存的示例更改。放弃更改并离开？')) return false;
  document.querySelectorAll('.app-choice input').forEach((input) => { input.checked = savedApps.has(input.value); });
  document.querySelectorAll('.recipient-choice').forEach((input) => { input.checked = savedRecipients.has(input.value); });
  updateRecipients();
  [...dirtyForms].forEach((form) => form.reset());
  dirtyForms.clear();
  updateApps();
  return true;
}
function navigate(id) {
  if (id !== currentPage && !discardDrafts()) return;
  const target = $(id);
  currentPage = id;
  const platform = target.dataset.platform;
  document.body.dataset.platform = platform;
  document.body.dataset.wide = id === 'e-settings';
  $('platform').value = platform;
  $('scenario-panel').hidden = platform !== 'android';
  $('android-nav').hidden = platform !== 'android';
  pages.forEach((page) => { page.hidden = page !== target; });
  const primary = ['a-sync', 'a-apps'].includes(id) ? id : 'a-settings';
  document.querySelectorAll('#android-nav button').forEach((button) => {
    if (button.dataset.go === primary) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  $('page-directory').replaceChildren(...pages.filter((page) => page.dataset.platform === platform).map((page) => {
    const button = document.createElement('button');
    button.textContent = page.dataset.title;
    button.dataset.go = page.id;
    if (page.id === id) button.setAttribute('aria-current', 'page');
    return button;
  }));
  target.querySelector('h2').focus({ preventScroll: true });
}
function updateApps() {
  const search = $('app-search').value.trim().toLowerCase();
  let visibleCount = 0;
  apps.forEach((app, index) => {
    const row = $(`app-${index}`);
    const matches = `${app.name} ${app.package}`.toLowerCase().includes(search);
    const type = $('app-type').value;
    row.hidden = !matches || (type === 'regular' && app.system) || (type === 'system' && !app.system)
      || ($('app-scope').value === 'selected' && !row.querySelector('input').checked);
    if (!row.hidden) visibleCount++;
  });
  $('app-empty').hidden = visibleCount > 0;
  $('selected-count').textContent = `已选 ${selectedValues('.app-choice input').size} 项`;
  $('save-apps').disabled = !selectionDirty('.app-choice input', savedApps);
  $('app-save-state').textContent = selectionDirty('.app-choice input', savedApps) ? '有未保存的选择' : '选择已保存';
  $('selection-summary').textContent = savedApps.size ? `已选择 ${savedApps.size} 个应用` : '未选择同步应用';
}
apps.forEach((app, index) => {
  // Only the fixed fictional fixture above is rendered as HTML; user-entered text is never interpolated.
  const row = document.createElement('div');
  row.id = `app-${index}`;
  row.className = 'app-row';
  row.innerHTML = `<label class="app-choice"><span class="app-icon" aria-hidden="true">${app.icon}</span><span class="app-text"><strong>${app.name}</strong><small class="package">${app.package}</small></span><input type="checkbox" value="${app.package}" aria-label="同步 ${app.name} ${app.package}"></label><button data-policy="${index}">应用设置 ›</button>`;
  row.querySelector('input').checked = savedApps.has(app.package);
  row.querySelector('input').addEventListener('change', updateApps);
  $('app-list').append(row);
  const option = document.createElement('option');
  option.value = index;
  option.textContent = `${app.name} · ${app.package}`;
  $('policy-app').append(option);
});
function updatePolicyHeading() {
  const app = apps[Number($('policy-app').value)];
  $('policy-heading').innerHTML = `<span class="app-icon" aria-hidden="true">${app.icon}</span><span class="app-text"><strong>${app.name}</strong><small class="package">${app.package}</small></span>`;
}
function updatePolicyMode() {
  const mode = $('policy-mode').value;
  $('custom-policy').hidden = mode !== 'custom';
  $('effective-policy').textContent = {
    inherit: '示例初始默认：按钮操作、回复、清除均关闭。',
    view: '只允许查看通知，按钮操作、回复和清除均关闭。',
    all: '允许按钮操作、回复和清除。',
    custom: '分别选择此应用允许的操作。',
  }[mode];
}
function updateScenario() {
  $('scenario').value = scenario;
  const content = {
    ready: ['已连接服务', '等待所选应用产生通知', '暂停同步'],
    permission: ['需要通知访问权限', '权限已关闭，暂时无法读取新的通知。', '处理权限问题'],
    offline: ['连接中断', '正在重试，请检查网络或私有服务。', '查看连接说明'],
    paused: ['同步已暂停', '恢复后按当前应用选择继续同步。', '恢复同步'],
  }[scenario];
  if (scenario === 'ready' && savedRecipients.size === 0) {
    content.splice(0, 3, '未选择接收设备', '选择接收设备后，再向该设备同步通知。', '选择接收设备');
  }
  ['sync-title', 'sync-body', 'sync-action'].forEach((id, index) => { $(id).textContent = content[index]; });
  $('access-status').textContent = scenario === 'permission' ? '未开启' : '已允许';
  $('grant-access').textContent = scenario === 'permission' ? '前往授权' : '查看系统设置';
  $('permission-summary').textContent = scenario === 'permission' ? '通知访问需要重新授权' : '通知访问与状态通知已允许';
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.go) navigate(button.dataset.go);
  if (button.dataset.demo) feedback(button.dataset.demo);
  if (button.dataset.policy !== undefined) {
    navigate('a-app-policy');
    if (currentPage !== 'a-app-policy') return;
    $('policy-app').value = button.dataset.policy;
    previousPolicyApp = $('policy-app').value;
    $('policy-form').reset();
    updatePolicyHeading();
  }
});
$('platform').addEventListener('change', () => {
  navigate({ android: 'a-sync', extension: 'e-list', admin: 's-devices' }[$('platform').value]);
  $('platform').value = $(currentPage).dataset.platform;
});
$('scenario').addEventListener('change', () => { scenario = $('scenario').value; updateScenario(); });
$('sync-action').addEventListener('click', () => {
  if (scenario === 'ready' && savedRecipients.size === 0) return navigate('a-recipients');
  if (scenario === 'permission') return navigate('a-permissions');
  if (scenario === 'offline') return feedback('此处将提供检查网络与私有服务的步骤。本原型没有尝试连接。');
  scenario = scenario === 'paused' ? 'ready' : 'paused';
  updateScenario();
  feedback('仅切换暂停／恢复的界面示例。真实业务暂停尚待实现。');
});
$('grant-access').addEventListener('click', () => {
  feedback('真实应用将在授权后返回并重新检查。此处只模拟「返回后权限已允许」，没有申请系统权限。');
  if (scenario === 'permission') { scenario = 'ready'; updateScenario(); }
});
['app-search', 'app-scope', 'app-type'].forEach((id) => $(id).addEventListener('input', updateApps));
['select-visible', 'clear-visible'].forEach((id) => $(id).addEventListener('click', () => {
  document.querySelectorAll('.app-row:not([hidden]) input').forEach((input) => { input.checked = id === 'select-visible'; });
  updateApps();
}));
$('save-apps').addEventListener('click', () => {
  savedApps = selectedValues('.app-choice input'); updateApps(); feedback('应用选择已保留在当前演示页面，刷新后恢复示例。未修改手机配置。');
});
$('policy-app').addEventListener('change', () => {
  if (!discardDrafts()) { $('policy-app').value = previousPolicyApp; return; }
  previousPolicyApp = $('policy-app').value;
  $('policy-form').reset(); updatePolicyHeading();
});
$('policy-mode').addEventListener('change', updatePolicyMode);
document.querySelectorAll('.demo-settings').forEach((form) => {
  form.addEventListener('input', () => dirtyForms.add(form));
  form.addEventListener('reset', () => { dirtyForms.delete(form); setTimeout(updatePolicyMode, 0); });
  form.addEventListener('submit', (event) => {
    event.preventDefault(); dirtyForms.delete(form);
    feedback('保存按钮的交互示意，未实现配置保存、继承计算或跨页面联动。正式设置会显示真实保存结果。');
  });
});
$('notification-source').addEventListener('change', () => {
  let count = 0;
  document.querySelectorAll('[data-source]').forEach((item) => {
    item.hidden = $('notification-source').value !== 'all' && $('notification-source').value !== item.dataset.source;
    if (!item.hidden) count++;
  });
  $('notification-count').textContent = `当前 ${count} 条`;
});
document.querySelectorAll('[data-setting]').forEach((button) => button.addEventListener('click', () => {
  if (!discardDrafts()) return;
  $('e-connection').hidden = button.dataset.setting !== 'connection';
  $('e-display').hidden = button.dataset.setting !== 'display';
  document.querySelectorAll('[data-setting]').forEach((item) => {
    if (item === button) item.setAttribute('aria-current', 'page'); else item.removeAttribute('aria-current');
  });
}));
$('approve-device').addEventListener('click', () => {
  $('approval-state').textContent = '已批准（演示）'; $('approve-device').disabled = true;
  feedback('仅演示审批状态变化，没有授权任何真实设备。');
});
$('generate-code').addEventListener('click', () => { $('sample-code').hidden = false; feedback('这里只展示加入码的承载区域，没有生成可使用的凭据。'); });
function updateRecipients() {
  const dirty = selectionDirty('.recipient-choice', savedRecipients);
  $('save-recipients').disabled = !dirty;
  $('recipient-save-state').textContent = dirty ? '有未保存的选择' : '选择已保存';
  $('recipient-empty').hidden = selectedValues('.recipient-choice').size > 0;
  $('recipient-summary').textContent = savedRecipients.size ? `已选择 ${savedRecipients.size} 个接收设备` : '未选择接收设备';
}
document.querySelectorAll('.recipient-choice').forEach((input) => input.addEventListener('change', updateRecipients));
$('save-recipients').addEventListener('click', () => {
  savedRecipients = selectedValues('.recipient-choice'); updateRecipients(); updateScenario();
  feedback('接收设备选择只保留在本页，刷新后重置。生产端尚未实现按设备限制发送或操作权限。');
});
updateApps(); updateRecipients(); updatePolicyHeading(); updatePolicyMode(); updateScenario(); navigate(currentPage);
