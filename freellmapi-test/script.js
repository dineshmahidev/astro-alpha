// FreeLLMAPI Playground - script.js
// Vanilla JS, no dependencies

const LS_KEY = 'freellmapi_playground';

// State
let settings = loadSettings();
let models = [];
let selectedModel = '';
let chatHistory = [];
let isLoading = false;

// --- LocalStorage ---

function loadSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { baseUrl: '', apiKey: '', model: '' };
  } catch {
    return { baseUrl: '', apiKey: '', model: '' };
  }
}

function saveSettings() {
  settings.baseUrl = document.getElementById('inputBaseUrl').value.trim().replace(/\/+$/, '');
  settings.apiKey = document.getElementById('inputApiKey').value.trim();
  settings.model = selectedModel;
  localStorage.setItem(LS_KEY, JSON.stringify(settings));
}

function clearSettings() {
  settings = { baseUrl: '', apiKey: '', model: '' };
  localStorage.removeItem(LS_KEY);
  document.getElementById('inputBaseUrl').value = '';
  document.getElementById('inputApiKey').value = '';
  document.getElementById('selectModel').innerHTML = '<option value="">Load models first...</option>';
  document.getElementById('modelDetails').textContent = 'No model selected';
  document.getElementById('modelCount').textContent = '';
  models = [];
  selectedModel = '';
  updateStats({ status: 'Disconnected', model: '-' });
  log('Settings cleared.');
}

// --- Tabs ---

function showTab(tab) {
  document.getElementById('tabAdmin').classList.toggle('hidden', tab !== 'admin');
  document.getElementById('tabChat').classList.toggle('hidden', tab !== 'chat');
  document.getElementById('btnAdmin').classList.toggle('btn-gold', tab === 'admin');
  document.getElementById('btnAdmin').classList.toggle('btn-outline', tab !== 'admin');
  document.getElementById('btnChat').classList.toggle('btn-gold', tab === 'chat');
  document.getElementById('btnChat').classList.toggle('btn-outline', tab !== 'chat');
}

// --- Logging ---

function log(msg) {
  const el = document.getElementById('apiLog');
  const time = new Date().toLocaleTimeString();
  el.textContent = `[${time}] ${msg}\n` + el.textContent;
}

// --- Stats ---

function updateStats(data) {
  if (data.status !== undefined) document.getElementById('statStatus').textContent = data.status;
  if (data.model !== undefined) document.getElementById('statModel').textContent = data.model;
  if (data.provider !== undefined) document.getElementById('statProvider').textContent = data.provider;
  if (data.time !== undefined) document.getElementById('statTime').textContent = data.time;
  if (data.prompt !== undefined) document.getElementById('statPrompt').textContent = data.prompt;
  if (data.completion !== undefined) document.getElementById('statCompletion').textContent = data.completion;
  if (data.total !== undefined) document.getElementById('statTotal').textContent = data.total;
}

// --- API Helpers ---

function getHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (settings.apiKey) {
    h['Authorization'] = `Bearer ${settings.apiKey}`;
  }
  return h;
}

function getBaseUrl() {
  return settings.baseUrl || document.getElementById('inputBaseUrl').value.trim().replace(/\/+$/, '');
}

// --- Load Models ---

async function loadModels() {
  saveSettings();
  const base = getBaseUrl();
  if (!base) {
    log('ERROR: Enter a Base URL first.');
    return;
  }

  log(`Fetching models from ${base}/models ...`);

  try {
    const res = await fetch(`${base}/models`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    log(`Status: ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const body = await res.text();
      log(`Error response: ${body.substring(0, 500)}`);
      updateStats({ status: `Error ${res.status}` });
      return;
    }

    const data = await res.json();
    models = data.data || data || [];

    const select = document.getElementById('selectModel');
    select.innerHTML = '';

    if (models.length === 0) {
      select.innerHTML = '<option value="">No models found</option>';
      log('No models returned by API.');
      return;
    }

    // Sort by id
    models.sort((a, b) => (a.id || '').localeCompare(b.id || ''));

    models.forEach((m, i) => {
      const opt = document.createElement('option');
      opt.value = m.id || '';
      const provider = m.owned_by || m.provider || '';
      opt.textContent = provider ? `${m.id} (${provider})` : m.id;
      select.appendChild(opt);
    });

    document.getElementById('modelCount').textContent = `(${models.length} loaded)`;

    // Restore saved model
    if (settings.model && models.find(m => m.id === settings.model)) {
      select.value = settings.model;
      selectedModel = settings.model;
      onModelChange();
    } else if (models.length > 0) {
      selectedModel = models[0].id;
      onModelChange();
    }

    log(`Loaded ${models.length} models successfully.`);
    updateStats({ status: 'Connected' });
  } catch (err) {
    log(`ERROR: ${err.message}`);
    updateStats({ status: 'Error' });
  }
}

// --- Model Change ---

function onModelChange() {
  const select = document.getElementById('selectModel');
  selectedModel = select.value;
  settings.model = selectedModel;
  localStorage.setItem(LS_KEY, JSON.stringify(settings));

  const model = models.find(m => m.id === selectedModel);
  const details = document.getElementById('modelDetails');

  if (!model) {
    details.textContent = 'No model selected';
    document.getElementById('chatModelBadge').textContent = 'No model selected';
    updateStats({ model: '-' });
    return;
  }

  const info = {
    id: model.id,
    provider: model.owned_by || model.provider || 'unknown',
    object: model.object,
    created: model.created ? new Date(model.created * 1000).toISOString() : null,
    context_length: model.context_length || model.max_context_length || null,
    capabilities: model.capabilities || null,
  };

  details.textContent = JSON.stringify(info, null, 2);

  const provider = model.owned_by || model.provider || 'unknown';
  document.getElementById('chatModelBadge').textContent = `${selectedModel} (${provider})`;
  updateStats({ model: selectedModel, provider: provider });

  saveSettings();
}

// --- Test Connection ---

async function testConnection() {
  saveSettings();
  const base = getBaseUrl();
  if (!base) {
    log('ERROR: Enter a Base URL first.');
    return;
  }

  log(`Testing connection to ${base}/models ...`);

  try {
    const start = Date.now();
    const res = await fetch(`${base}/models`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(10000),
    });
    const ms = Date.now() - start;

    log(`Status: ${res.status} ${res.statusText} (${ms}ms)`);

    if (!res.ok) {
      const body = await res.text();
      log(`Error: ${body.substring(0, 300)}`);
      updateStats({ status: `Error ${res.status}`, time: `${ms}ms` });
      return;
    }

    const data = await res.json();
    const count = (data.data || data || []).length;
    log(`OK - ${count} models available. Latency: ${ms}ms`);
    updateStats({ status: 'Connected', time: `${ms}ms` });
  } catch (err) {
    log(`ERROR: ${err.message}`);
    updateStats({ status: 'Error' });
  }
}

// --- Chat ---

function renderChatMessages() {
  const container = document.getElementById('chatMessages');

  if (chatHistory.length === 0) {
    container.innerHTML = `
      <div class="chat-empty">
        <div class="chat-empty-icon">&#9733;</div>
        <p>Start a conversation to test FreeLLMAPI models</p>
        <p class="chat-empty-sub">Select a model in Admin tab, then come back here</p>
      </div>`;
    return;
  }

  container.innerHTML = chatHistory.map((msg, i) => `
    <div class="chat-msg chat-msg-${msg.role}">
      <div class="chat-msg-header">
        <span class="chat-msg-role ${msg.role}">${msg.role === 'user' ? 'You' : 'AI'}</span>
        <span class="chat-msg-meta">${msg.meta || ''}</span>
      </div>
      <div class="chat-msg-body ${msg.error ? 'chat-msg-error' : ''}">${escapeHtml(msg.content)}</div>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function addMessage(role, content, meta, error) {
  chatHistory.push({ role, content, meta, error });
  renderChatMessages();
}

async function sendMessage() {
  if (isLoading) return;

  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  saveSettings();
  const base = getBaseUrl();
  const model = selectedModel;

  if (!base || !model) {
    addMessage('ai', 'Please set Base URL and load models in the Admin tab first.', '', true);
    return;
  }

  input.value = '';
  autoResize(input);
  addMessage('user', text);

  // Show loading
  isLoading = true;
  document.getElementById('btnSend').disabled = true;
  document.getElementById('sendText').classList.add('hidden');
  document.getElementById('sendLoader').classList.remove('hidden');

  const loadIndex = chatHistory.length;
  chatHistory.push({ role: 'ai', content: '', meta: '' });
  renderChatMessages();

  const start = Date.now();

  try {
    const messages = chatHistory
      .filter(m => m.content && !m.error)
      .filter((_, i, arr) => i < arr.length - 1 || arr[i].role === 'user')
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content }));

    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: model,
        messages: messages,
      }),
      signal: AbortSignal.timeout(60000),
    });

    const ms = Date.now() - start;

    // Check response headers for provider info
    const headerProvider = res.headers.get('x-provider') || res.headers.get('x-model-provider') || '';
    const headerModel = res.headers.get('x-model') || res.headers.get('x-model-id') || '';

    log(`Response: ${res.status} ${res.statusText} (${ms}ms)`);

    if (!res.ok) {
      const body = await res.text();
      chatHistory.splice(loadIndex, 1);
      addMessage('ai', `HTTP ${res.status}: ${body.substring(0, 500)}`, `${ms}ms | Error`, true);
      updateStats({ status: `Error ${res.status}`, time: `${ms}ms` });
      return;
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content || '(empty response)';
    const finishReason = choice?.finish_reason || '';

    // Usage
    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || '-';
    const completionTokens = usage.completion_tokens || '-';
    const totalTokens = usage.total_tokens || '-';

    // Provider from response body
    const provider = data.provider || data.model || headerProvider || 'unknown';
    const responseModel = data.model || headerModel || model;

    const meta = `${ms}ms | ${responseModel}${finishReason ? ' | ' + finishReason : ''}`;

    chatHistory.splice(loadIndex, 1);
    addMessage('ai', content, meta);

    updateStats({
      status: 'Connected',
      model: responseModel,
      provider: provider,
      time: `${ms}ms`,
      prompt: String(promptTokens),
      completion: String(completionTokens),
      total: String(totalTokens),
    });

    log(`Tokens: prompt=${promptTokens} completion=${completionTokens} total=${totalTokens}`);
    if (finishReason) log(`Finish reason: ${finishReason}`);

  } catch (err) {
    const ms = Date.now() - start;
    chatHistory.splice(loadIndex, 1);
    addMessage('ai', `Error: ${err.message}`, `${ms}ms`, true);
    log(`ERROR: ${err.message}`);
    updateStats({ status: 'Error', time: `${ms}ms` });
  } finally {
    isLoading = false;
    document.getElementById('btnSend').disabled = false;
    document.getElementById('sendText').classList.remove('hidden');
    document.getElementById('sendLoader').classList.add('hidden');
  }
}

function clearChat() {
  chatHistory = [];
  renderChatMessages();
  updateStats({ prompt: '-', completion: '-', total: '-' });
}

// --- Keyboard / Textarea ---

function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
  // Restore settings - clear stale localhost defaults
  const saved = loadSettings();
  if (!saved.baseUrl || saved.baseUrl.includes('localhost')) {
    saved.baseUrl = 'https://api.groq.com/openai/v1';
    localStorage.setItem(LS_KEY, JSON.stringify(saved));
    settings = saved;
  }
  document.getElementById('inputBaseUrl').value = settings.baseUrl;
  document.getElementById('inputApiKey').value = settings.apiKey || '';

  // Auto-resize textarea
  const textarea = document.getElementById('chatInput');
  textarea.addEventListener('input', () => autoResize(textarea));

  // Show admin tab by default
  showTab('admin');

  log('Playground ready. Enter your FreeLLMAPI Base URL and API Key, then click Load Models.');
});
