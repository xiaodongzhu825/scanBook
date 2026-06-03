/**
 * 孔夫子网 API - 登录与商品操作
 */

/**
 * 登录孔夫子（从响应Cookie中提取PHPSESSID）
 * @param {string} username 用户名（手机号）
 * @param {string} password 明文密码
 * @returns {Promise<{success: boolean, token: string, message: string}>}
 */
export function login(username, password) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: 'https://login.kongfz.com/Pc/Login/account',
			method: 'POST',
			header: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
			},
			data: {
				loginName: username,
				loginPass: password,
				autoLogin: '0',
				returnUrl: 'http://user.kongfz.com/'
			},
			success: (res) => {
				console.log('孔夫子登录响应 status:', res.statusCode)
				console.log('孔夫子登录响应 header:', JSON.stringify(res.header))
				console.log('孔夫子登录响应 data:', typeof res.data === 'string' ? res.data.substring(0, 500) : JSON.stringify(res.data))

				// 提取PHPSESSID
				let phpsessid = ''
				// 尝试从 Set-Cookie 中提取
				const setCookie = res.header['Set-Cookie'] || res.header['set-cookie']
				if (setCookie) {
					const match = setCookie.match(/PHPSESSID=([^;]+)/)
					if (match) {
						phpsessid = match[1]
					}
				}

				// 判断登录是否成功
				const responseText = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
				const isSuccess = responseText.includes('login.kongfz.cn/Pc/Session/rsync') ||
					responseText.includes('window.location.href') ||
					res.statusCode === 302 ||
					(res.statusCode === 200 && phpsessid)

				if (isSuccess && phpsessid) {
					resolve({
						success: true,
						token: phpsessid,
						message: '登录成功'
					})
				} else if (res.statusCode === 200 && responseText.includes('errCode')) {
					// 尝试解析错误信息
					try {
						const json = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
						if (json.errCode === 1001) {
							resolve({ success: false, token: '', message: '账号或密码错误' })
						} else if (json.errCode === 1005) {
							resolve({ success: false, token: '', message: '密码错误' })
						} else if (json.errCode === 1009) {
							resolve({ success: false, token: '', message: '调用次数已达上限，请稍后再试' })
						} else {
							resolve({ success: false, token: '', message: json.msg || '登录失败' })
						}
					} catch (e) {
						resolve({ success: false, token: '', message: '登录失败，请检查账号密码' })
					}
				} else {
					resolve({ success: false, token: '', message: '登录失败，请检查网络和账号密码' })
				}
			},
			fail: (err) => {
				console.error('孔夫子登录请求失败:', err)
				resolve({ success: false, token: '', message: '网络请求失败，请检查网络连接' })
			}
		})
	})
}

/**
 * 获取商品列表（分页）
 * @param {string} token PHPSESSID
 * @param {object} params 筛选参数
 * @param {function} onProgress 进度回调
 * @returns {Promise<Array>}
 */
export function fetchItems(token, params = {}, onProgress) {
	const items = []
	const pageSize = 50
	let currentPage = 1

	return new Promise((resolve, reject) => {
		const fetchPage = (page) => {
			const requestBody = {
				requestType: 'onSale',
				page: page,
				size: pageSize
			}
			if (params.itemSn) requestBody.itemSn = params.itemSn
			if (params.priceMin) requestBody.priceMin = params.priceMin
			if (params.priceMax) requestBody.priceMax = params.priceMax
			if (params.startCreateTime) requestBody.startCreateTime = params.startCreateTime
			if (params.endCreateTime) requestBody.endCreateTime = params.endCreateTime

			uni.request({
				url: 'https://seller.kongfz.com/pc-gw/book-manage-service/client/pc/goods/unSold/list',
				method: 'POST',
				header: {
					'Content-Type': 'application/json',
					'Cookie': `PHPSESSID=${token}`,
					'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
				},
				data: requestBody,
				success: (res) => {
					if (res.data && res.data.data && res.data.data.list) {
						const list = res.data.data.list
						items.push(...list.map(item => ({ id: item.itemId || item.id, status: 'wait' })))
						if (onProgress) onProgress(items.length, res.data.data.total || 0)

						if (list.length >= pageSize) {
							currentPage++
							setTimeout(() => fetchPage(currentPage), 1000)
						} else {
							resolve(items)
						}
					} else {
						resolve(items)
					}
				},
				fail: (err) => {
					console.error('获取商品列表失败:', err)
					reject(err)
				}
			})
		}
		fetchPage(currentPage)
	})
}

export default {
	login,
	fetchItems
}

/**
 * 搜索孔夫子在售商品（需要登录Cookie）
 * @param {string} keyword ISBN或书名
 * @param {object} options {phpsessid, page}
 * @returns {Promise<{total: number, list: Array}>}
 * list中每项: {id, title, author, press, priceText, imgBigUrl, shopName, qualityText, pubDateText, postage}
 */
export function searchProducts(keyword, options = {}) {
	const { phpsessid = '', page = 1 } = options
	return new Promise((resolve, reject) => {
		uni.request({
			url: 'https://search.kongfz.com/pc-gw/search-web/client/pc/product/keyword/list',
			method: 'GET',
			data: {
				dataType: 0,
				keyword: keyword,
				page: page,
				userArea: '13003000000'
			},
			header: {
				'Cookie': phpsessid ? `PHPSESSID=${phpsessid}` : ''
			},
			success: (res) => {
				console.log('孔夫子在售搜索响应:', res.statusCode, res.data)
				if (res.statusCode === 200 && res.data && res.data.status === 1) {
					const itemResp = res.data.data && res.data.data.itemResponse
					if (itemResp) {
						resolve({
							total: itemResp.total || 0,
							list: itemResp.list || []
						})
					} else {
						resolve({ total: 0, list: [] })
					}
				} else {
					resolve({ total: 0, list: [] })
				}
			},
			fail: (err) => {
				console.error('孔夫子搜索失败:', err)
				resolve({ total: 0, list: [] })
			}
		})
	})
}
