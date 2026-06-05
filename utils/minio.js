/**
 * MinIO 文件上传工具
 * 使用 AWS Signature V4 签名，通过 PUT 直传到 MinIO
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
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * HMAC-SHA256 返回 Uint8Array（用于签名链）
 */
function hmacRaw(key, msg) {
  const hexResult = sha256.hmac(key, msg)
  return hexToBytes(hexResult)
}

/**
 * 生成 AWS V4 签名密钥链
 */
function getSignatureKey(secretKey, dateStamp, region, service) {
  let k = hmacRaw('AWS4' + secretKey, dateStamp)
  k = hmacRaw(k, region)
  k = hmacRaw(k, service)
  return hmacRaw(k, 'aws4_request')
}

function sha256Hex(str) {
  return sha256(str)
}

// ====== AWS V4 签名 ======

/**
 * 为 PUT 请求构建 Authorization 签名头
 */
function buildAuthHeader(objectKey, date) {
  const dateStr = date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate())
  const amzDate = dateStr + 'T' + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds()) + 'Z'

  const host = CFG.endpoint
  const canonicalUri = '/' + CFG.bucket + '/' + objectKey

  const signedHeadersMap = {
    host: host,
    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
    'x-amz-date': amzDate
  }

  const signedHeadersList = Object.keys(signedHeadersMap).sort()
  const canonicalHeaders = signedHeadersList.map(k => k + ':' + signedHeadersMap[k] + '\n').join('')
  const signedHeadersStr = signedHeadersList.join(';')

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeadersStr,
    'UNSIGNED-PAYLOAD'
  ].join('\n')

  const credentialScope = [dateStr, CFG.region, 's3', 'aws4_request'].join('/')
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join('\n')

  const signingKey = getSignatureKey(CFG.secretKey, dateStr, CFG.region, 's3')
  const signature = bytesToHex(hmacRaw(signingKey, stringToSign))

  const authHeader = 'AWS4-HMAC-SHA256 Credential=' + CFG.accessKey + '/' + credentialScope +
    ', SignedHeaders=' + signedHeadersStr + ', Signature=' + signature

  return { authHeader, amzDate, host }
}

// ====== 文件读取（兼容 uniapp 多端） ======

/**
 * 读取本地图片为 base64
 */
function readFileAsBase64(filePath) {
  return new Promise((resolve, reject) => {
    // 优先使用 plus.io（HBuilder 原生 App）
    if (typeof plus !== 'undefined' && plus.io) {
      plus.io.readFile(filePath, { encoding: 'base64' }, function (data) {
        resolve(data)
      }, function (err) {
        // 如果 plus.io 失败，回退到 XHR
        console.warn('plus.io.readFile 失败，回退到 XHR:', JSON.stringify(err))
        readViaXHR(filePath, resolve, reject)
      })
    } else {
      readViaXHR(filePath, resolve, reject)
    }
  })
}

/**
 * 通过 XMLHttpRequest 读取本地文件（H5 / 开发环境）
 */
function readViaXHR(filePath, resolve, reject) {
  try {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', filePath, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      const reader = new FileReader()
      reader.onload = function () {
        const base64 = reader.result.split(',')[1] || ''
        resolve(base64)
      }
      reader.onerror = function () {
        reject(new Error('FileReader 读取失败'))
      }
      reader.readAsDataURL(xhr.response)
    }
    xhr.onerror = function () {
      reject(new Error('XHR 读取文件失败'))
    }
    xhr.send()
  } catch (e) {
    reject(new Error('读取文件异常: ' + e.message))
  }
}

/**
 * Base64 转 ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binaryStr = atob(base64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * 生成 UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

/**
 * 获取文件扩展名（不含点）
 */
function getFileExt(filePath) {
  const m = filePath.match(/\.(\w+)$/)
  return m ? m[1].toLowerCase() : 'jpg'
}

/**
 * 根据扩展名获取 Content-Type
 */
function getContentType(ext) {
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp'
  }
  return map[ext] || 'image/jpeg'
}

// ====== 主上传接口 ======

/**
 * 上传单张图片到 MinIO
 * @param {string} filePath - 本地文件路径（uni.chooseImage 返回的 tempFilePath）
 * @param {string} typeDir - 目录名，默认 'Isbn'
 * @returns {Promise<string>} 可公开访问的图片 URL
 */
export function uploadImage(filePath, typeDir = 'Isbn') {
  return new Promise(function (resolve, reject) {
    readFileAsBase64(filePath)
      .then(function (base64) {
        const arrayBuffer = base64ToArrayBuffer(base64)

        // 构建对象路径：年-月-日/Isbn/uuid.ext
        const now = new Date()
        const datePath = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate())
        const ext = getFileExt(filePath)
        const objectKey = datePath + '/' + typeDir + '/' + generateUUID() + '.' + ext
        const contentType = getContentType(ext)

        // 构建 AWS V4 签名
        const { authHeader, amzDate, host } = buildAuthHeader(objectKey, now)

        // PUT URL
        const url = CFG.protocol + '://' + host + '/' + CFG.bucket + '/' + objectKey

        console.log('【MinIO上传】URL:', url)
        console.log('【MinIO上传】contentType:', contentType)
        console.log('【MinIO上传】contentLength:', arrayBuffer.byteLength)

        // 通过 XMLHttpRequest 发送 PUT
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Authorization', authHeader)
        xhr.setRequestHeader('x-amz-content-sha256', 'UNSIGNED-PAYLOAD')
        xhr.setRequestHeader('x-amz-date', amzDate)
        xhr.setRequestHeader('Content-Type', contentType)

        xhr.onload = function () {
          if (xhr.status === 200) {
            console.log('【MinIO上传】成功:', url)
            resolve(url)
          } else {
            console.error('【MinIO上传】失败, HTTP:', xhr.status, xhr.responseText)
            reject(new Error('上传失败: HTTP ' + xhr.status))
          }
        }
        xhr.onerror = function () {
          console.error('【MinIO上传】网络错误')
          reject(new Error('上传网络错误'))
        }
        xhr.ontimeout = function () {
          reject(new Error('上传超时'))
        }
        xhr.timeout = 120000

        xhr.send(arrayBuffer)
      })
      .catch(function (err) {
        reject(err)
      })
  })
}

/**
 * 批量上传多张图片到 MinIO
 * @param {string[]} filePaths - 本地文件路径数组
 * @param {string} typeDir - 目录名
 * @returns {Promise<string[]>} 图片 URL 数组
 */
export function uploadImages(filePaths, typeDir = 'Isbn') {
  const tasks = filePaths.map(function (fp) {
    return uploadImage(fp, typeDir)
  })
  return Promise.all(tasks)
}

export default { uploadImage, uploadImages }
