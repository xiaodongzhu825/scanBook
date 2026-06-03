/**
 * API 签名生成工具 - 用于 192.168.101.213:9090 接口
 */

import md5 from 'blueimp-md5'

// 配置参数
const APP_KEY = 'psi'
const CLIENT_ID = 'psi'
const APP_SECRET = 'psi_api_sign_secret'
const SIGN_METHOD = 'md5'

// API基础地址
const BASE_URL = 'https://psi.api.buzhiyushu.cn'

/**
 * 对参数键进行排序（与服务器Go代码 sortKeysWithIndex 完全一致）
 * Go代码使用 < 进行字符串比较（按字节字典序）
 */
function sortKeys(keys) {
	const indexPattern = /^(.+)\[(\d+)\](.*)$/
	keys.sort((keyI, keyJ) => {
		const ma = indexPattern.exec(keyI)
		const mb = indexPattern.exec(keyJ)
		if (ma && mb) {
			const [, preA, idxA, sufA] = ma
			const [, preB, idxB, sufB] = mb
			if (preA !== preB) return preA < preB ? -1 : 1
			const numA = parseInt(idxA, 10)
			const numB = parseInt(idxB, 10)
			if (numA !== numB) return numA - numB
			return sufA < sufB ? -1 : 1
		}
		// 至少有一个不是带索引的键，使用 < 比较（与Go一致）
		return keyI < keyJ ? -1 : (keyI > keyJ ? 1 : 0)
	})
}

/**
 * 计算签名（与服务器Go代码 calculateSign 一致）
 * 1. 收集所有参数（跳过sign）
 * 2. 按key排序
 * 3. 拼接 key1=value1&key2=value2...
 * 4. 前后加 secret
 * 5. MD5并转大写
 */
function calculateSign(params) {
	// 收集参数，跳过sign
	const entries = []
	for (const key in params) {
		if (key === 'sign') continue
		const value = params[key]
		if (value === undefined || value === null) continue
		entries.push({ key, value: String(value) })
	}

	// 排序entries数组（按key）
	entries.sort((a, b) => {
		const indexPattern = /^(.+)\[(\d+)\](.*)$/
		const ma = indexPattern.exec(a.key)
		const mb = indexPattern.exec(b.key)
		if (ma && mb) {
			const [, preA, idxA, sufA] = ma
			const [, preB, idxB, sufB] = mb
			if (preA !== preB) return preA < preB ? -1 : 1
			const numA = parseInt(idxA, 10)
			const numB = parseInt(idxB, 10)
			if (numA !== numB) return numA - numB
			return sufA < sufB ? -1 : 1
		}
		return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0)
	})

	// 拼接签名字符串
	const signStr = entries.map(e => `${e.key}=${e.value}`).join('&')
	console.log('calculateSign 签名字符串:', signStr)

	// 前后加secret
	const signWithSecret = APP_SECRET + signStr + APP_SECRET
	console.log('calculateSign 加secret后:', signWithSecret)

	const sign = md5(signWithSecret).toUpperCase()
	console.log('calculateSign 生成的sign:', sign)

	return sign
}

/**
 * 生成带签名的URL（带系统参数：app_key, client_id, timestamp, sign_method）
 * 用于仓库列表等接口
 */
function generateSignedUrl(baseUrl, params = {}) {
	const timestamp = Math.floor(Date.now() / 1000).toString()

	// 构建完整参数（业务参数 + 系统参数）
	const allParams = { ...params }
	delete allParams.sign
	allParams.app_key = APP_KEY
	allParams.client_id = CLIENT_ID
	allParams.timestamp = timestamp
	allParams.sign_method = SIGN_METHOD

	// 计算签名
	const sign = calculateSign(allParams)

	// 构建URL查询字符串（所有参数按key排序）
	const keys = Object.keys(allParams)
	sortKeys(keys)
	const queryParts = keys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
	queryParts.push(`sign=${sign}`)

	const separator = baseUrl.includes('?') ? '&' : '?'
	return `${baseUrl}${separator}${queryParts.join('&')}`
}

/**
 * 生成简单签名的URL（不带系统参数，只有业务参数签名）
 * 用于货位列表等接口
 */
function generateSimpleSignedUrl(baseUrl, params = {}) {
	// 只使用业务参数
	const allParams = { ...params }
	delete allParams.sign

	// 计算签名（不带系统参数）
	const sign = calculateSign(allParams)

	// 构建URL查询字符串（所有参数按key排序）
	const keys = Object.keys(allParams)
	sortKeys(keys)
	const queryParts = keys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
	queryParts.push(`sign=${sign}`)

	const separator = baseUrl.includes('?') ? '&' : '?'
	return `${baseUrl}${separator}${queryParts.join('&')}`
}

/**
 * 获取token（优先从登录缓存获取，失败时尝试自动登录）
 */
function getAuthToken() {
	// 从登录页存储获取
	const token = uni.getStorageSync('token')
	if (token) return token
	// PSI专用key
	const psiToken = uni.getStorageSync('psi_token')
	if (psiToken) return psiToken
	// 硬编码备用
	return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6MjU1LCJ1c2VybmFtZSI6IjE4OTA0MDU2ODAwIiwiYWJvdXRfaWQiOjE5NjUyNTQ3NzQzMjc1MzM1NzAsImlzcyI6InBzaS1zeXN0ZW0iLCJleHAiOjE3ODA1NjY0NTYsIm5iZiI6MTc4MDQ4MDA1NiwiaWF0IjoxNzgwNDgwMDU2fQ.yWTRso0ps-z64iA7nSKK4t3EYOy54CYoLtATyzFxrqI'
}

/**
 * 尝试自动登录PSI，返回新token或null
 */
function autoPsiLogin() {
	return new Promise((resolve) => {
		const phone = uni.getStorageSync('phoneNumber') || ''
		const password = uni.getStorageSync('remembered_password') || ''
		if (!phone || !password) {
			resolve(null)
			return
		}
		console.log('【PSI自动登录】尝试使用存储账号', phone)
		uni.request({
			url: 'https://api.buzhiyushu.cn/auth/interFaceLogin',
			method: 'POST',
			header: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ZWxhc3RpYzo1bVJESVVnNTJWQzBmcDE0bnctRg=='
			},
			data: {
				clientId: 'cec96a240989d1c6bcd55f86fca702b7',
				phoneNumber: phone,
				password: password
			},
			success: (res) => {
				const data = res.data
				if (data && data.code === 200 && data.data && data.data.access_token) {
					const newToken = data.data.access_token
					console.log('【PSI自动登录】成功')
					uni.setStorageSync('token', newToken)
					uni.setStorageSync('psi_token', newToken)
					resolve(newToken)
				} else {
					console.error('【PSI自动登录】失败:', JSON.stringify(data))
					resolve(null)
				}
			},
			fail: (err) => {
				console.error('【PSI自动登录】网络错误:', JSON.stringify(err))
				resolve(null)
			}
		})
	})
}

/**
 * 带自动登录重试的PSI API请求
 * @param {Function} requestFn - 实际发起请求的函数，接收token，返回Promise<响应数据>
 * @param {string} apiName - 接口名称（用于日志）
 */
function requestWithRetry(requestFn, apiName) {
	return requestFn(getAuthToken()).catch((err) => {
		const errMsg = err.message || String(err)
		// 只有401/无效令牌才尝试自动登录
		if (errMsg.includes('401') || errMsg.includes('无效的认证令牌')) {
			console.log(`【${apiName}】令牌无效，尝试自动登录`)
			return autoPsiLogin().then((newToken) => {
				if (newToken) {
					// 使用新token重试一次
					return requestFn(newToken)
				}
				// 自动登录失败，抛出需要跳转登录页的错误
				throw new Error('NEED_LOGIN:登录已过期，请重新登录')
			})
		}
		// 其他错误
		throw err
	})
}

/**
 * 获取仓库列表
 */
export function getWarehouseList(params = {}) {
	return requestWithRetry((token) => {
		return new Promise((resolve, reject) => {
			const url = generateSignedUrl(`${BASE_URL}/api/warehouse/list`, params)
			console.log('【仓库列表】请求URL:', url)
			console.log('【仓库列表】请求参数:', JSON.stringify(params))
			uni.request({
				url: url,
				method: 'GET',
				header: {
					'Authorization': 'Bearer ' + token
				},
				success: (res) => {
					console.log('【仓库列表】响应状态码:', res.statusCode)
					console.log('【仓库列表】响应数据:', JSON.stringify(res.data))
					if (res.statusCode === 200) {
						resolve(res.data)
					} else {
						const data = res.data
						if (data && data.error) {
							reject(new Error(`${res.statusCode}:${data.error}`))
						} else {
							reject(new Error(`请求失败: ${res.statusCode}`))
						}
					}
				},
				fail: (err) => {
					console.error('【仓库列表】请求失败:', JSON.stringify(err))
					reject(err)
				}
			})
		})
	}, '仓库列表')
}

/**
 * 获取货位列表
 */
export function getLocationList(params = {}) {
	return requestWithRetry((token) => {
		return new Promise((resolve, reject) => {
			const url = generateSignedUrl(`${BASE_URL}/api/location/list`, params)
			console.log('【货位列表】请求URL:', url)
			console.log('【货位列表】请求参数:', JSON.stringify(params))
			uni.request({
				url: url,
				method: 'GET',
				header: {
					'Authorization': 'Bearer ' + token
				},
				success: (res) => {
					console.log('【货位列表】响应状态码:', res.statusCode)
					console.log('【货位列表】响应数据:', JSON.stringify(res.data))
					if (res.statusCode === 200) {
						resolve(res.data)
					} else {
						const data = res.data
						if (data && data.error) {
							reject(new Error(`${res.statusCode}:${data.error}`))
						} else {
							reject(new Error(`请求失败: ${res.statusCode}`))
						}
					}
				},
				fail: (err) => {
					console.error('【货位列表】请求失败:', JSON.stringify(err))
					reject(err)
				}
			})
		})
	}, '货位列表')
}

/**
 * 图书中心 - 根据ISBN查询图书信息
 */
export function searchBookByIsbn(isbn) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: `https://book.center.yushutx.com/api/es/searchByISBN?isbn=${isbn}`,
			method: 'GET',
			header: {
				'Authorization': 'Basic ZWxhc3RpYzo1bVJESVVnNTJWQzBmcDE0bnctRg==',
				'Accept': '*/*',
				'User-Agent': 'Apifox/1.0.0 (https://apifox.com)'
			},
			success: (res) => {
				if (res.statusCode === 200 && res.data && res.data.data) {
					resolve(res.data.data)
				} else if (res.statusCode === 200 && res.data && res.data.code === 0 && res.data.data) {
					resolve(res.data.data)
				} else {
					reject(new Error('未查询到图书信息'))
				}
			},
			fail: (err) => {
				console.error('图书中心查询失败:', err)
				reject(err)
			}
		})
	})
}

export default {
	getWarehouseList,
	getLocationList,
	searchBookByIsbn,
	generateSignedUrl
}
