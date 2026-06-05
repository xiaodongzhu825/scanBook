/**
 * MinIO 文件上传工具
 * 使用 AWS Signature V4 签名，通过 uni.request PUT 直传到 MinIO
 *
 * 签名算法与 curl/fetch 完全一致：
 *   SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date
 *   x-amz-content-sha256 = 实际文件内容sha256
 */

import sha256 from 'js-sha256'

// ====== MinIO 配置 ======
const CFG = {
  endpoint: 'shxy.image.yushutx.com',
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  bucket: 'scan-book',
  region: 'us-east-1',
  protocol: 'https'
}

// ====== 工具函数 ======

function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

function hexToBytes(hex) {
  const bytes = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  return new Uint8Array(bytes)
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(function (b) { return (b >> 4).toString(16) + (b & 0xf).toString(16) }).join('')
}

function hmacRaw(key, msg) {
  return hexToBytes(sha256.hmac(key, msg))
}

function getSignatureKey(secretKey, dateStamp, region, service) {
  var k = hmacRaw('AWS4' + secretKey, dateStamp)
  k = hmacRaw(k, region)
  k = hmacRaw(k, service)
  return hmacRaw(k, 'aws4_request')
}

function sha256Hex(str) {
  return sha256(str)
}

function sha256Bytes(bytes) {
  return sha256(bytes)
}

// ====== 时间同步 ======

var _timeOffset = 0
var _timeSyncing = false

function syncServerTime() {
  return new Promise(function (resolve) {
    if (_timeSyncing) {
      setTimeout(function () { resolve(new Date(Date.now() + _timeOffset)) }, 500)
      return
    }
    _timeSyncing = true
    console.log('【MinIO时间同步】开始...')

    var resolved = false
    function finish(serverDate) {
      if (resolved) return
      resolved = true
      _timeSyncing = false
      if (serverDate) {
        _timeOffset = serverDate.getTime() - Date.now()
        console.log('【MinIO时间同步】完成, 服务器时间:', serverDate.toISOString(), '偏移:', _timeOffset, 'ms')
      } else {
        console.warn('【MinIO时间同步】失败, 使用本地时间')
      }
      resolve(new Date(Date.now() + _timeOffset))
    }

    // 方法1: plus.net.XMLHttpRequest GET（App 环境，最可靠）
    if (typeof plus !== 'undefined' && plus.net && plus.net.XMLHttpRequest) {
      try {
        var xhr1 = new plus.net.XMLHttpRequest()
        xhr1.onreadystatechange = function () {
          if (xhr1.readyState === 4) {
            var d = xhr1.getResponseHeader('Date')
            if (d) { finish(new Date(d)); return }
          }
        }
        xhr1.open('GET', CFG.protocol + '://' + CFG.endpoint + '/')
        xhr1.send()
      } catch (e) { console.warn('【MinIO时间同步】xhr方式失败:', e) }
    }

    // 方法2: uni.request
    uni.request({
      url: CFG.protocol + '://' + CFG.endpoint + '/',
      method: 'GET',
      success: function (res) {
        var d = null
        if (res.header) d = res.header.Date || res.header.date
        if (!d && res.headers) d = res.headers.Date || res.headers.date
        if (d) { finish(new Date(d)); return }
      },
      fail: function (e) {
        console.warn('【MinIO时间同步】uni.request失败:', JSON.stringify(e))
      }
    })

    // 兜底：8秒后没拿到就用本地时间
    setTimeout(function () { finish(null) }, 8000)
  })
}

// ====== AWS V4 签名 ======

function buildAuthHeader(objectKey, date, contentType, contentSha256) {
  var dateStr = date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate())
  var amzDate = dateStr + 'T' + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds()) + 'Z'

  var host = CFG.endpoint
  var canonicalUri = '/' + CFG.bucket + '/' + objectKey

  var signedHeadersList = ['content-type', 'host', 'x-amz-content-sha256', 'x-amz-date']
  var canonicalHeaders =
    'content-type:' + contentType + '\n' +
    'host:' + host + '\n' +
    'x-amz-content-sha256:' + contentSha256 + '\n' +
    'x-amz-date:' + amzDate + '\n'
  var signedHeadersStr = signedHeadersList.join(';')

  var canonicalRequest =
    'PUT\n' + canonicalUri + '\n\n' + canonicalHeaders + signedHeadersStr + '\n' + contentSha256

  var credentialScope = dateStr + '/' + CFG.region + '/s3/aws4_request'
  var stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + credentialScope + '\n' + sha256Hex(canonicalRequest)

  var signingKey = getSignatureKey(CFG.secretKey, dateStr, CFG.region, 's3')
  var signature = bytesToHex(hmacRaw(signingKey, stringToSign))

  var authHeader = 'AWS4-HMAC-SHA256 Credential=' + CFG.accessKey + '/' + credentialScope +
    ', SignedHeaders=' + signedHeadersStr + ', Signature=' + signature

  return { authHeader: authHeader, amzDate: amzDate }
}

// ====== 文件读取（先读base64再转Uint8Array用于计算sha256） ======

function readFileAsBase64(filePath) {
  return new Promise(function (resolve, reject) {
    // uni-app 标准 API
    try {
      var fs = uni.getFileSystemManager()
      if (fs && fs.readFile) {
        fs.readFile({
          filePath: filePath,
          encoding: 'base64',
          success: function (res) { resolve(res.data) },
          fail: function () {
            // 回退到 plus.io
            if (typeof plus !== 'undefined' && plus.io && plus.io.FileReader) {
              readViaPlus(filePath, resolve, reject)
            } else {
              reject(new Error('无法读取文件'))
            }
          }
        })
      } else if (typeof plus !== 'undefined' && plus.io && plus.io.FileReader) {
        readViaPlus(filePath, resolve, reject)
      } else {
        reject(new Error('当前环境不支持文件读取'))
      }
    } catch (e) {
      reject(new Error('读取文件异常: ' + e.message))
    }
  })
}

function readViaPlus(filePath, resolve, reject) {
  plus.io.resolveLocalFileSystemURL(filePath, function (entry) {
    entry.file(function (file) {
      var reader = new plus.io.FileReader()
      reader.onloadend = function (e) {
        var data = e.target.result
        if (data.indexOf(',') > -1) data = data.split(',')[1]
        resolve(data)
      }
      reader.onerror = function () { reject(new Error('FileReader失败')) }
      reader.readAsDataURL(file)
    }, function () { reject(new Error('获取文件对象失败')) })
  }, function () { reject(new Error('resolveLocalFileSystemURL失败')) })
}

function base64ToBytes(base64) {
  // 手动解码 base64 到 Uint8Array（避免 atob 兼容问题）
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  base64 = base64.replace(/=+$/, '')
  var bytes = []
  for (var i = 0; i < base64.length; i += 4) {
    var a = chars.indexOf(base64[i])
    var b = chars.indexOf(base64[i + 1])
    var c = chars.indexOf(base64[i + 2])
    var d = chars.indexOf(base64[i + 3])
    bytes.push((a << 2) | (b >> 4))
    if (c >= 0) bytes.push(((b & 0xf) << 4) | (c >> 2))
    if (d >= 0) bytes.push(((c & 3) << 6) | d)
  }
  return bytes
}

// ====== 上传 ======

/**
 * 使用 uni.request 上传单张图片到 MinIO（与 fetch 示例等价）
 */
export function uploadImage(filePath, typeDir) {
  if (typeDir === undefined) typeDir = 'Isbn'
  return new Promise(function (resolve, reject) {
    // 第一步：同步服务器时间
    syncServerTime().then(function (serverDate) {
      // 第二步：读取文件
      readFileAsBase64(filePath).then(function (base64) {
        // 解码为二进制字节数组
        var fileBytes = base64ToBytes(base64)
        var fileByteArray = new Uint8Array(fileBytes)

        // 计算文件内容的 SHA256（使用整数数组避免 to UTF-8 的问题）
        var fileSha256 = sha256Bytes(fileBytes)

        // 构建对象路径
        var now = serverDate
        var datePath = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
        var ext = (filePath.match(/\.(\w+)$/) || [])[1] || 'jpg'
        ext = ext.toLowerCase()
        var objectKey = datePath + '/' + typeDir + '/' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        }) + '.' + ext

        var contentTypeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp' }
        var contentType = contentTypeMap[ext] || 'image/jpeg'

        // 构建签名（使用实际文件sha256）
        var sig = buildAuthHeader(objectKey, now, contentType, fileSha256)

        var url = CFG.protocol + '://' + CFG.endpoint + '/' + CFG.bucket + '/' + objectKey

        console.log('【MinIO上传】URL:', url)
        console.log('【MinIO上传】contentType:', contentType)
        console.log('【MinIO上传】contentLength:', fileByteArray.length)
        console.log('【MinIO上传】x-amz-content-sha256:', fileSha256)

        // 第三步：使用 uni.request PUT 上传（与 fetch 完全一致）
        uni.request({
          url: url,
          method: 'PUT',
          header: {
            'Content-Type': contentType,
            'X-Amz-Content-Sha256': fileSha256,
            'X-Amz-Date': sig.amzDate,
            'Authorization': sig.authHeader
          },
          data: fileByteArray.buffer,
          success: function (res) {
            if (res.statusCode === 200) {
              console.log('【MinIO上传】成功:', url)
              resolve(url)
            } else {
              console.error('【MinIO上传】失败, HTTP:', res.statusCode, JSON.stringify(res.data))
              reject(new Error('上传失败: HTTP ' + res.statusCode))
            }
          },
          fail: function (err) {
            console.error('【MinIO上传】网络错误:', JSON.stringify(err))
            reject(new Error('上传网络错误'))
          }
        })
      }).catch(function (err) { reject(err) })
    }).catch(function (err) { reject(err) })
  })
}

export function uploadImages(filePaths, typeDir) {
  if (typeDir === undefined) typeDir = 'Isbn'
  var tasks = []
  for (var i = 0; i < filePaths.length; i++) {
    tasks.push(uploadImage(filePaths[i], typeDir))
  }
  return Promise.all(tasks)
}

export default { uploadImage, uploadImages }
