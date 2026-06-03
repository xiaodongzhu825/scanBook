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
 * 获取token（从本地存储或登录接口）
 */
function getAuthToken() {
	// 优先从本地存储获取
	const token = uni.getStorageSync('psi_token')
	if (token) return token
	
	// 使用curl中的固定token（临时方案）
	return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6MjU1LCJ1c2VybmFtZSI6IjE4OTA0MDU2ODAwIiwiYWJvdXRfaWQiOjE5NjUyNTQ3NzQzMjc1MzM1NzAsImlzcyI6InBzaS1zeXN0ZW0iLCJleHAiOjE3ODA0NjkxNzMsIm5iZiI6MTc4MDM4Mjc3MywiaWF0IjoxNzgwMzgyNzczfQ.FQkDiDzNj0tN3ct0RJCnL7s03vstf7uMmeXqqek8sME'
}

/**
 * 获取仓库列表
 */
export function getWarehouseList(params = {}) {
	return new Promise((resolve, reject) => {
		const url = generateSignedUrl(`${BASE_URL}/api/warehouse/list`, params)
		console.log('请求仓库列表URL:', url)
		uni.request({
			url: url,
			method: 'GET',
			header: {
				'Authorization': 'Bearer ' + getAuthToken()
			},
			success: (res) => {
				console.log('仓库列表请求成功:', res.statusCode, res.data)
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					reject(new Error(`请求失败: ${res.statusCode}`))
				}
			},
			fail: (err) => {
				console.error('仓库列表请求失败:', err)
				reject(err)
			}
		})
	})
}

/**
 * 获取货位列表
 */
export function getLocationList(params = {}) {
	return new Promise((resolve, reject) => {
		const url = generateSignedUrl(`${BASE_URL}/api/location/list`, params)
		console.log('请求货位列表URL:', url)
		uni.request({
			url: url,
			method: 'GET',
			header: {
				'Authorization': 'Bearer ' + getAuthToken()
			},
			success: (res) => {
				console.log('货位列表请求成功:', res.statusCode, res.data)
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					reject(new Error(`请求失败: ${res.statusCode}`))
				}
			},
			fail: (err) => {
				console.error('货位列表请求失败:', err)
				reject(err)
			}
		})
	})
}

export default {
	getWarehouseList,
	getLocationList,
	generateSignedUrl
}
