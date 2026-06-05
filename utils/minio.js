/**
 * MinIO 文件上传工具
 * 使用 AWS Signature V4 签名，通过 plus.net.XMLHttpRequest PUT 直传
 */

import sha256 from 'js-sha256'

// ====== MinIO 配置 ======
var CFG = {
  endpoint: 'shxy.image.yushutx.com',
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  bucket: 'scan-book',
  region: 'us-east-1',
  protocol: 'https'
}

// ====== 工具函数 ======

function pad(n) { return n < 10 ? '0' + n : '' + n }

function hmacRaw(key, msg) {
  return hexToBytes(sha256.hmac(key, msg))
}

function hexToBytes(hex) {
  var bytes = []
  for (var i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16))
  }
  return new Uint8Array(bytes)
}

function bytesToHex(bytes) {
  var s = ''
  for (var i = 0; i < bytes.length; i++) {
    s += '0123456789abcdef'[(bytes[i] >> 4) & 0xf]
    s += '0123456789abcdef'[bytes[i] & 0xf]
  }
  return s
}

function sha256Hex(s) { return sha256(s) }

// ====== AWS V4 签名 ======

function buildAuthHeader(objectKey, date, contentType, contentSha256) {
  var dateStr = date.getUTCFullYear() + pad(date.getUTCMonth() + 1) + pad(date.getUTCDate())
  var amzDate = dateStr + 'T' + pad(date.getUTCHours()) + pad(date.getUTCMinutes()) + pad(date.getUTCSeconds()) + 'Z'

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
    'PUT\n' + canonicalUri + '\n\n' + canonicalHeaders + '\n' + signedHeadersStr + '\n' + contentSha256

  var credentialScope = dateStr + '/' + CFG.region + '/s3/aws4_request'
  var stringToSign = 'AWS4-HMAC-SHA256\n' + amzDate + '\n' + credentialScope + '\n' + sha256Hex(canonicalRequest)

  var signingKey = hmacRaw('AWS4' + CFG.secretKey, dateStr)
  signingKey = hmacRaw(signingKey, CFG.region)
  signingKey = hmacRaw(signingKey, 's3')
  signingKey = hmacRaw(signingKey, 'aws4_request')
  var signature = bytesToHex(hmacRaw(signingKey, stringToSign))

  var authHeader = 'AWS4-HMAC-SHA256 Credential=' + CFG.accessKey + '/' + credentialScope +
    ', SignedHeaders=' + signedHeadersStr + ', Signature=' + signature

  return { authHeader: authHeader, amzDate: amzDate }
}

// ====== 文件读取（直接读 ArrayBuffer，避免 base64 编解码） ======

function readFileAsArrayBuffer(filePath) {
  return new Promise(function (resolve, reject) {
    if (typeof plus !== 'undefined' && plus.io && plus.io.FileReader) {
      plus.io.resolveLocalFileSystemURL(filePath, function (entry) {
        entry.file(function (file) {
          var reader = new plus.io.FileReader()
          reader.onloadend = function (e) {
            resolve(e.target.result)
          }
          reader.onerror = function () { reject(new Error('FileReader失败')) }
          reader.readAsArrayBuffer(file)
        }, function () { reject(new Error('获取文件对象失败')) })
      }, function (err) {
        reject(new Error('resolveLocalFileSystemURL失败: ' + JSON.stringify(err)))
      })
      return
    }
    reject(new Error('plus.io 不可用'))
  })
}

// ====== 时间同步 ======

var _cachedTimeOffset = null

function syncServerTime() {
  return new Promise(function (resolve) {
    console.log('【MinIO时间同步】开始...')
    if (typeof plus !== 'undefined' && plus.net && plus.net.XMLHttpRequest) {
      try {
        var xhr = new plus.net.XMLHttpRequest()
        var timer = setTimeout(function () {
          console.warn('【MinIO时间同步】超时')
          xhr.abort()
          resolve(new Date())
        }, 10000)

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            clearTimeout(timer)
            try {
              var dateStr = xhr.getResponseHeader('Date')
              console.log('【MinIO时间同步】readyState=4, status:', xhr.status, ', Date头:', dateStr)
              if (dateStr) {
                var serverMs = Date.parse(dateStr)
                if (!isNaN(serverMs)) {
                  _cachedTimeOffset = serverMs - Date.now()
                  console.log('【MinIO时间同步】成功! 偏移:', _cachedTimeOffset, 'ms')
                  resolve(new Date(Date.now() + _cachedTimeOffset))
                  return
                }
              }
            } catch (e) {
              console.warn('【MinIO时间同步】解析异常:', e)
            }
            resolve(new Date())
          }
        }
        xhr.open('GET', CFG.protocol + '://' + CFG.endpoint + '/')
        xhr.send()
        return
      } catch (e) {
        console.warn('【MinIO时间同步】创建XHR失败:', e)
      }
    }
    resolve(new Date())
  })
}

function getServerDate() {
  if (_cachedTimeOffset !== null) {
    return new Date(Date.now() + _cachedTimeOffset)
  }
  return new Date()
}

// ====== 上传 ======

export function uploadImage(filePath, typeDir) {
  if (typeDir === undefined) typeDir = 'Isbn'
  return new Promise(function (resolve, reject) {
    syncServerTime().then(function () {
      readFileAsArrayBuffer(filePath).then(function (arrayBuffer) {
        var payloadHash = 'UNSIGNED-PAYLOAD'

        var now = getServerDate()
        var datePath = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
        var ext = (filePath.match(/\.(\w+)$/) || [])[1] || 'jpg'
        ext = ext.toLowerCase()
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
        })
        var objectKey = datePath + '/' + typeDir + '/' + uuid + '.' + ext
        var ct = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp' }
        var contentType = ct[ext] || 'image/jpeg'

        var sig = buildAuthHeader(objectKey, now, contentType, payloadHash)
        var url = CFG.protocol + '://' + CFG.endpoint + '/' + CFG.bucket + '/' + objectKey

        console.log('【MinIO上传】URL:', url)
        console.log('【MinIO上传】contentType:', contentType)
        console.log('【MinIO上传】bufferSize:', arrayBuffer.byteLength)
        console.log('【MinIO上传】服务器时间:', now.toISOString())

        // 使用 plus.net.XMLHttpRequest PUT
        if (typeof plus !== 'undefined' && plus.net && plus.net.XMLHttpRequest) {
          try {
            var xhr = new plus.net.XMLHttpRequest()
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                console.log('【MinIO上传】status:', xhr.status)
                if (xhr.status === 200) {
                  console.log('【MinIO上传】成功:', url)
                  resolve(url)
                } else {
                  console.error('【MinIO上传】失败, HTTP:', xhr.status, (xhr.responseText || xhr.response || '').substring(0, 200))
                  reject(new Error('上传失败: HTTP ' + xhr.status))
                }
              }
            }
            xhr.open('PUT', url)
            xhr.setRequestHeader('Content-Type', contentType)
            xhr.setRequestHeader('X-Amz-Content-Sha256', payloadHash)
            xhr.setRequestHeader('X-Amz-Date', sig.amzDate)
            xhr.setRequestHeader('Authorization', sig.authHeader)
            console.log('【MinIO上传】发送数据, 大小:', arrayBuffer.byteLength, '字节')
            xhr.send(arrayBuffer)
            return
          } catch (e) {
            console.warn('【MinIO上传】plus XHR失败:', e)
          }
        }

        reject(new Error('当前环境不支持上传'))
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
