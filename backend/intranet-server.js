/**
 * AI写真自动化 - 内网完整版服务器
 * 兼容 Node.js 12+（CentOS 7 / GLIBC 2.17）
 * 零 npm 依赖：只使用 Node.js 内置模块
 *
 * 功能：
 *   1. 提供前端网页（serve frontend/dist 静态文件）
 *   2. /api/analyze  - 上传图片 → 千问分析
 *   3. /api/generate - 上传图片 + prompt → Seedream 生成
 *   4. /api/health   - 健康检查
 *
 * 调用快手内网 AI 网关：
 *   - 千问：http://wanqing.internal/api/gateway/v1/endpoints
 *   - 豆包：http://llm-gateway.internal
 *
 * 启动方式：
 *   WQ_API_KEY=xxx DOUBAO_API_KEY=yyy node intranet-server.js
 */

'use strict';

var http = require('http');
var https = require('https');
var urlModule = require('url');
var path = require('path');
var fs = require('fs');
var os = require('os');

// ============ 配置 ============
var PORT = process.env.PORT || 3000;
var WQ_API_KEY = process.env.WQ_API_KEY || '';
var QWEN_API_BASE = process.env.QWEN_API_BASE || 'http://wanqing.internal/api/gateway/v1/endpoints';
var QWEN_MODEL = process.env.QWEN_MODEL || 'ep-025psa-1769571497286958801';
var DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || '';
var DOUBAO_API_BASE = process.env.DOUBAO_API_BASE || 'http://llm-gateway.internal';

// 前端静态文件目录（与 intranet-server.js 同级的 frontend/dist）
var FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist');
// 上传文件临时目录
var UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ============ MIME 类型 ============
var MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':  'font/ttf',
};

// ============ 工具函数 ============

/** 发送 HTTP/HTTPS POST 请求 */
function httpRequest(targetUrl, method, body, headers, timeoutMs) {
  return new Promise(function (resolve, reject) {
    var parsed;
    try { parsed = new urlModule.URL(targetUrl); }
    catch (e) {
      parsed = urlModule.parse(targetUrl);
      parsed.hostname = (parsed.host || '').split(':')[0];
      parsed.port = (parsed.host || '').split(':')[1] || null;
    }
    var isHttps = (parsed.protocol || '').indexOf('https') === 0;
    var transport = isHttps ? https : http;
    var postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : '';

    var opts = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: (parsed.pathname || '/') + (parsed.search || ''),
      method: method || 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }, headers || {}),
      timeout: timeoutMs || 180000
    };

    var req = transport.request(opts, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        var raw = Buffer.concat(chunks).toString('utf8');
        try {
          var data = JSON.parse(raw);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: data });
          } else {
            var e = new Error('HTTP ' + res.statusCode); e.status = res.statusCode; e.data = data; reject(e);
          }
        } catch (ex) {
          var e2 = new Error('Invalid JSON: ' + raw.substring(0, 300)); e2.status = res.statusCode; reject(e2);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', function () { req.destroy(); reject(new Error('Timeout: ' + targetUrl)); });
    if (postData) req.write(postData);
    req.end();
  });
}

/** 解析 multipart/form-data，返回 { fields, files } */
function parseMultipart(req) {
  return new Promise(function (resolve, reject) {
    var contentType = req.headers['content-type'] || '';
    // 支持带引号和不带引号的 boundary，如 boundary=xxx 或 boundary="xxx"
    var boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^\s;]+))/);
    if (!boundaryMatch) return reject(new Error('No boundary in content-type: ' + contentType));
    var boundaryVal = boundaryMatch[1] || boundaryMatch[2];
    var delimiter = Buffer.from('\r\n--' + boundaryVal);
    var firstDelimiter = Buffer.from('--' + boundaryVal);

    var chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('error', reject);
    req.on('end', function () {
      try {
        var buf = Buffer.concat(chunks);
        var fields = {};
        var files = {};

        // 找到第一个 boundary 起始位置
        var pos = buf.indexOf(firstDelimiter);
        if (pos === -1) return resolve({ fields: fields, files: files });
        pos += firstDelimiter.length;

        // 跳过第一个 boundary 后的 \r\n
        if (buf[pos] === 0x0D && buf[pos+1] === 0x0A) pos += 2;
        else return resolve({ fields: fields, files: files }); // 应该是 \r\n

        while (pos < buf.length) {
          // 找下一个 delimiter（\r\n--boundary）
          var nextPos = buf.indexOf(delimiter, pos);
          if (nextPos === -1) nextPos = buf.length;

          // 当前 part 的内容
          var part = buf.slice(pos, nextPos);

          // 分离 headers 和 body（\r\n\r\n 分隔）
          var CRLF2 = Buffer.from('\r\n\r\n');
          var headerEnd = part.indexOf(CRLF2);
          if (headerEnd !== -1) {
            var headerStr = part.slice(0, headerEnd).toString('utf8');
            var bodyBuf = part.slice(headerEnd + 4);

            // 精确匹配 name="..."（不能匹配到 filename= 里的 name 部分）
            // Content-Disposition: form-data; name="image"; filename="xxx.jpg"
            var dispLine = (headerStr.match(/Content-Disposition:[^\r\n]*/i) || [''])[0];
            // 用 (?:^|;)\s*name= 确保不匹配 filename 里的 name
            var nameMatch = dispLine.match(/(?:^|;)\s*name="([^"]+)"/i);
            if (nameMatch) {
              var fieldName = nameMatch[1];
              var filenameMatch = dispLine.match(/(?:^|;)\s*filename="([^"]+)"/i);
              if (filenameMatch) {
                var ctMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
                var mimeType = ctMatch ? ctMatch[1].trim() : 'application/octet-stream';
                var origName = filenameMatch[1].trim();
                var ext = path.extname(origName) || '.bin';
                var tmpFile = path.join(UPLOAD_DIR, 'up-' + Date.now() + '-' + Math.random().toString(36).substr(2,6) + ext);
                fs.writeFileSync(tmpFile, bodyBuf);
                console.log('[multipart] 解析文件字段:', fieldName, '文件名:', origName, '大小:', bodyBuf.length, 'bytes');
                files[fieldName] = { path: tmpFile, originalname: origName, mimetype: mimeType, size: bodyBuf.length };
              } else {
                fields[fieldName] = bodyBuf.toString('utf8');
              }
            }
          }

          // 移动到下一个 part
          if (nextPos >= buf.length) break;
          pos = nextPos + delimiter.length;
          // 检查是否是结束 boundary（--）
          if (buf[pos] === 0x2D && buf[pos+1] === 0x2D) break;
          // 跳过 \r\n
          if (buf[pos] === 0x0D && buf[pos+1] === 0x0A) pos += 2;
          else break;
        }

        console.log('[multipart] 解析完成，fields:', Object.keys(fields), 'files:', Object.keys(files));
        resolve({ fields: fields, files: files });
      } catch (ex) {
        console.error('[multipart] 解析异常:', ex.message);
        reject(ex);
      }
    });
  });
}

/** 图片文件转 base64 data URI */
function imageToBase64(filePath) {
  var ext = path.extname(filePath).toLowerCase().replace('.', '');
  var mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };
  var mimeType = mimeMap[ext] || 'image/jpeg';
  var data = fs.readFileSync(filePath);
  return 'data:' + mimeType + ';base64,' + data.toString('base64');
}

/** 发送 JSON 响应 */
function sendJson(res, statusCode, obj) {
  var body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

/** 提供静态文件 */
function serveStatic(res, filePath) {
  try {
    var stat = fs.statSync(filePath);
    var ext = path.extname(filePath).toLowerCase();
    var mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType, 'Content-Length': stat.size });
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    // 文件不存在，返回 index.html（前端路由）
    var indexPath = path.join(FRONTEND_DIST, 'index.html');
    if (fs.existsSync(indexPath)) {
      var html = fs.readFileSync(indexPath);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': html.length });
      res.end(html);
    } else {
      res.writeHead(404); res.end('Not Found');
    }
  }
}

// ============ 千问（万晴内网网关）============

var ANALYSIS_PROMPT =
  '请详细分析这张图片，生成一段完整的图像描述，用于指导AI图像生成。描述需要包含以下两个方面：\n\n' +
  '**第一部分：画面内容描述（30%）**\n' +
  '- 场景与主体：描述画面中的主要场景、人物或物体\n' +
  '- 构图与布局：画面的构图方式、元素排布\n' +
  '- 背景与环境：背景的特点和环境氛围\n\n' +
  '**第二部分：视觉风格特征（70%，重点）**\n\n' +
  '1. **色彩方案**：整体色调（暖/冷/中性）、主色调、饱和度\n' +
  '2. **光线与曝光**：整体曝光、光线特征、光影效果\n' +
  '3. **对比度与层次**：整体对比度、阴影细节\n' +
  '4. **特殊效果与滤镜**：胶片感、后期风格\n' +
  '5. **画面质感与氛围**：清晰度、颗粒感、整体氛围\n\n' +
  '**输出要求**：先概括画面内容，然后详细描述视觉风格，用中文输出。';

function analyzeImageFile(filePath) {
  var base64 = imageToBase64(filePath);
  console.log('[千问] 分析图片，文件大小:', (fs.statSync(filePath).size / 1024).toFixed(1) + 'KB');
  var reqBody = {
    model: QWEN_MODEL,
    messages: [{ role: 'user', content: [
      { type: 'image_url', image_url: { url: base64 } },
      { type: 'text', text: ANALYSIS_PROMPT }
    ]}]
  };
  return httpRequest(
    QWEN_API_BASE + '/chat/completions', 'POST', reqBody,
    { 'Authorization': 'Bearer ' + WQ_API_KEY }, 180000
  ).then(function (resp) {
    var prompt = resp.data.choices[0].message.content;
    var tokens = (resp.data.usage && resp.data.usage.total_tokens) || 0;
    console.log('[千问] 分析成功，prompt 长度:', prompt.length);
    return { success: true, prompt: prompt, tokens: tokens };
  }).catch(function (err) {
    var msg = (err.data && err.data.error && (err.data.error.message || JSON.stringify(err.data.error))) || err.message;
    console.error('[千问] 失败:', msg);
    return { success: false, error: msg };
  });
}

// ============ Seedream（豆包内网网关）============

var SEEDREAM_SUFFIX =
  '\n\n【核心生成要求】：\n' +
  '1. 严格遵循参考图的视觉特征：色调、饱和度、对比度、光影、构图\n' +
  '2. 场景物品细节完整保留\n' +
  '3. 保持画面原生感和自然真实感\n' +
  '4. 人物可轻微优化但保持真实质感\n' +
  '5. 生成图要像参考图的同系列照片';

function generateImageFile(filePath, prompt) {
  var base64 = imageToBase64(filePath);
  console.log('[Seedream] 生成图片');
  var reqBody = {
    model: 'doubao-seedream-4-5-251128',
    prompt: prompt + SEEDREAM_SUFFIX,
    image: base64,
    sequential_image_generation: 'disabled',
    response_format: 'url',
    size: '2K',
    stream: false,
    watermark: false
  };
  return httpRequest(
    DOUBAO_API_BASE + '/llm-serve/v1/images/generations', 'POST', reqBody,
    { 'x-api-key': DOUBAO_API_KEY }, 240000
  ).then(function (resp) {
    var urls = [];
    if (resp.data && resp.data.data) resp.data.data.forEach(function (item) { if (item.url) urls.push(item.url); });
    if (!urls.length) return { success: false, error: '未提取到图片URL: ' + JSON.stringify(resp.data).substring(0, 200) };
    console.log('[Seedream] 生成成功:', urls[0]);
    return { success: true, imageUrls: urls };
  }).catch(function (err) {
    var msg = (err.data && err.data.error && (err.data.error.message || JSON.stringify(err.data.error))) || err.message;
    console.error('[Seedream] 失败:', msg);
    return { success: false, error: msg };
  });
}

// ============ 请求处理 ============

function handleRequest(req, res) {
  var parsed = urlModule.parse(req.url, true);
  var pathname = parsed.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') { res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); res.end(); return; }

  // ── API 路由 ──────────────────────────────

  // 健康检查
  if (pathname === '/api/health') {
    if (req.method === 'HEAD') { res.writeHead(200); res.end(); return; }
    sendJson(res, 200, { success: true, message: 'AI写真内网服务运行正常', node: process.version, qwen: WQ_API_KEY ? '已配置' : '未配置', doubao: DOUBAO_API_KEY ? '已配置' : '未配置', timestamp: new Date().toISOString() });
    return;
  }

  // 分析图片（上传文件）
  if (pathname === '/api/analyze' && req.method === 'POST') {
    parseMultipart(req).then(function (form) {
      var file = form.files && form.files.image;
      if (!file) { sendJson(res, 400, { success: false, error: '请上传图片文件' }); return; }
      console.log('[API] /api/analyze 收到文件:', file.originalname, file.size + 'bytes');
      return analyzeImageFile(file.path).then(function (result) {
        fs.unlink(file.path, function () {}); // 清理临时文件
        if (!result.success) sendJson(res, 500, { success: false, error: result.error });
        else sendJson(res, 200, { success: true, prompt: result.prompt, tokens: result.tokens });
      });
    }).catch(function (err) {
      console.error('[API] /api/analyze 错误:', err);
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }

  // 生成图片（上传文件 + prompt）
  if (pathname === '/api/generate' && req.method === 'POST') {
    parseMultipart(req).then(function (form) {
      var file = form.files && form.files.image;
      var prompt = form.fields && form.fields.prompt;
      if (!file) { sendJson(res, 400, { success: false, error: '请上传参考图片' }); return; }
      if (!prompt) { sendJson(res, 400, { success: false, error: '缺少 prompt 参数' }); return; }
      console.log('[API] /api/generate 收到文件:', file.originalname, '| prompt长度:', prompt.length);
      return generateImageFile(file.path, prompt).then(function (result) {
        fs.unlink(file.path, function () {}); // 清理临时文件
        if (!result.success) sendJson(res, 500, { success: false, error: result.error });
        else sendJson(res, 200, { success: true, imageUrls: result.imageUrls });
      });
    }).catch(function (err) {
      console.error('[API] /api/generate 错误:', err);
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }

  // ── 静态文件服务 ──────────────────────────

  // 把 /api/* 以外的所有请求都交给前端
  var safePath = pathname.replace(/\.\./g, '').replace(/^\//, '');
  var filePath = path.join(FRONTEND_DIST, safePath);

  // 如果是目录，找 index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // 如果文件不存在，返回 index.html（前端路由 SPA）
  if (!fs.existsSync(filePath)) {
    filePath = path.join(FRONTEND_DIST, 'index.html');
  }

  serveStatic(res, filePath);
}

// ============ 启动 ============

var server = http.createServer(handleRequest);

server.listen(PORT, '0.0.0.0', function () {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║      AI写真自动化 - 内网完整版           ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  访问地址: http://172.28.204.235:' + PORT + '    ║');
  console.log('║  Node 版本: ' + process.version + '                  ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  GET  /          网页主界面              ║');
  console.log('║  POST /api/analyze  分析参考图风格       ║');
  console.log('║  POST /api/generate 生成效果图           ║');
  console.log('║  GET  /api/health   健康检查             ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  千问: ' + (WQ_API_KEY ? '已配置 ✓' : '未配置 ✗') + '                      ║');
  console.log('║  豆包: ' + (DOUBAO_API_KEY ? '已配置 ✓' : '未配置 ✗') + '                      ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  if (!fs.existsSync(FRONTEND_DIST)) {
    console.log('⚠️  前端未构建！请先运行: cd frontend && npm install && npm run build');
    console.log('   然后把 frontend/dist 目录上传到服务器同级目录');
  } else {
    console.log('✅ 前端已就绪:', FRONTEND_DIST);
  }
  console.log('');
});
