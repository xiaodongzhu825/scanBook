<template>
	<view class="page-container">
		<!-- 首页内容 -->
		<view class="home-content" v-if="currentTab === 'home'">
			<!-- 页面标题 -->
			<view class="header">
				<text class="title">请选择上传方式</text>
			</view>

			<!-- 上传方式列表 -->
			<view class="upload-list">
				<!-- ISBN上传 -->
				<view class="upload-card" @click="handleISBNUpload">
					<view class="upload-icon isbn-icon">
						<text class="icon-emoji">📚</text>
					</view>
					<view class="upload-info">
						<text class="upload-title">ISBN上传</text>
						<text class="upload-desc">扫描或输入ISBN快速上架</text>
					</view>
					<view class="upload-arrow">
						<text class="arrow-text">›</text>
					</view>
				</view>

				<!-- 无ISBN上传 -->
				<view class="upload-card" @click="handleNoISBNUpload">
					<view class="upload-icon no-isbn-icon">
						<text class="icon-emoji">📷</text>
					</view>
					<view class="upload-info">
						<text class="upload-title">无ISBN上传</text>
						<text class="upload-desc">拍照识别无书籍信息上架</text>
					</view>
					<view class="upload-arrow">
						<text class="arrow-text">›</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 我的页面内容 -->
		<view class="mine-content" v-if="currentTab === 'mine'">
			<!-- 页面标题 -->
			<view class="header">
				<text class="title">个人中心</text>
			</view>

			<!-- 用户信息 -->
			<view class="user-card">
				<view class="user-avatar">
					<text class="avatar-emoji">👤</text>
				</view>
				<view class="user-info">
					<text class="user-name">用户名</text>
					<text class="version-text">系统版本：v{{ appVersion }}</text>
				</view>
			</view>

			<!-- 功能列表 -->
			<view class="menu-card">
				<view class="menu-item" @click="handleMenu('vip')">
					<text class="menu-icon">⭐</text>
					<text class="menu-title">开通会员</text>
					<view class="menu-arrow-wrap">
						<text class="menu-arrow">›</text>
					</view>
				</view>
				<view class="menu-item" @click="handleMenu('offline')">
					<text class="menu-icon">📋</text>
					<text class="menu-title">线下订单管理</text>
					<view class="menu-arrow-wrap">
						<text class="menu-arrow">›</text>
					</view>
				</view>
				<view class="menu-item" @click="handleMenu('shelf')">
					<text class="menu-icon">📦</text>
					<text class="menu-title">货架管理</text>
					<view class="menu-arrow-wrap">
						<text class="menu-arrow">›</text>
					</view>
				</view>
				<view class="menu-item" @click="handleMenu('refresh')">
					<text class="menu-icon">🔄</text>
					<text class="menu-title">孔网商品翻新</text>
					<view class="menu-arrow-wrap">
						<text class="menu-arrow">›</text>
					</view>
				</view>
				<view class="menu-item" @click="handleMenu('record')">
					<text class="menu-icon">📝</text>
					<text class="menu-title">上书记录</text>
					<view class="menu-arrow-wrap">
						<text class="menu-arrow">›</text>
					</view>
				</view>
				<view class="menu-item" @click="handleMenu('order')">
					<text class="menu-icon">📄</text>
					<text class="menu-title">仓库订单查询</text>
					<view class="menu-arrow-wrap">
						<text class="menu-arrow">›</text>
					</view>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-btn" @click="handleLogout">
				<text class="logout-text">退出登录</text>
			</view>
		</view>

		<!-- 返回功能入口 -->
		<view class="back-entry" @click="goBackToEntry">
			<text class="back-entry-icon">‹</text>
			<text class="back-entry-text">返回功能入口</text>
		</view>

		<!-- 底部导航栏 -->
		<view class="tab-bar">
			<view class="tab-item" :class="{ active: currentTab === 'home' }" @click="switchTab('home')">
				<text class="tab-icon">🏠</text>
				<text class="tab-text">首页</text>
			</view>
			<view class="tab-item" :class="{ active: currentTab === 'mine' }" @click="switchTab('mine')">
				<text class="tab-icon">👤</text>
				<text class="tab-text">我的</text>
			</view>
		</view>
	</view>
</template>

<script>
	// 读取 manifest.json 中的版本号（uni-app 编译时自动去除注释）
	var manifestData = {}
	try {
		manifestData = require('../../manifest.json')
	} catch (e) {
		manifestData = { versionName: '1.0.0' }
	}

	export default {
		data() {
			return {
				currentTab: 'home',
				appVersion: manifestData.versionName || '1.0.0'
			}
		},

		onLoad() {
			uni.setNavigationBarTitle({
				title: '入库助手'
			})
			// App 原生模式优先使用 plus.runtime.version
			try {
				if (typeof plus !== 'undefined' && plus.runtime && plus.runtime.version) {
					this.appVersion = plus.runtime.version
				}
			} catch (e) {}
		},

		methods: {
			// 切换Tab
			switchTab(tab) {
				this.currentTab = tab
				uni.setNavigationBarTitle({
					title: tab === 'home' ? '入库助手' : '我的'
				})
			},

			// ISBN上传
			handleISBNUpload() {
				const data = uni.getStorageSync('selectedWarehouseData')
				let params = 'tab=isbn'
				if (data && data.warehouseName && data.locationCode) {
					const encode = encodeURIComponent
					params += `&whName=${encode(data.warehouseName)}&whCode=${encode(data.warehouseCode)}&whId=${encode(data.warehouseId)}`
					params += `&locCode=${encode(data.locationCode)}&locName=${encode(data.locationName)}&locId=${encode(data.locationId)}`
				}
				uni.navigateTo({ url: `/pages/upload/upload?${params}` })
			},

			// 无ISBN上传
			handleNoISBNUpload() {
				const data = uni.getStorageSync('selectedWarehouseData')
				let params = 'tab=no-isbn'
				if (data && data.warehouseName && data.locationCode) {
					const encode = encodeURIComponent
					params += `&whName=${encode(data.warehouseName)}&whCode=${encode(data.warehouseCode)}&whId=${encode(data.warehouseId)}`
					params += `&locCode=${encode(data.locationCode)}&locName=${encode(data.locationName)}&locId=${encode(data.locationId)}`
				}
				uni.navigateTo({ url: `/pages/upload/upload?${params}` })
			},

			// 菜单点击
			handleMenu(type) {
				const menuNames = {
					vip: '开通会员',
					offline: '线下订单管理',
					shelf: '货架管理',
					refresh: '孔网商品翻新',
					record: '上书记录',
					order: '仓库订单查询'
				}

				// 开通会员跳转到VIP页面
				if (type === 'vip') {
					uni.navigateTo({
						url: '/pages/vip/vip'
					})
					return
				}

				// 上书记录跳转到记录页面
				if (type === 'record') {
					uni.navigateTo({
						url: '/pages/record/record'
					})
					return
				}

				// 仓库订单查询跳转到订单页面
				if (type === 'order') {
					uni.navigateTo({
						url: '/pages/order/order'
					})
					return
				}

				uni.showToast({
					title: menuNames[type],
					icon: 'none'
				})
				// TODO: 跳转到对应页面
			},

			// 退出登录
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							uni.removeStorageSync('token')
							uni.redirectTo({
								url: '/pages/login/login'
							})
						}
					}
				})
			},

			// 返回功能入口页面
			goBackToEntry() {
				uni.redirectTo({ url: '/pages/entry/entry' })
			}
		}
	}
</script>

<style>
.page-container {
	min-height: 100vh;
	background: #f5f6fa;
	padding-bottom: 100rpx;
	box-sizing: border-box;
}

/* ====== 页面标题 ====== */
.header {
	padding: 40rpx 0 32rpx;
	text-align: center;
}

.title {
	font-size: 32rpx;
	color: #1d2129;
	font-weight: 500;
}

/* ====== 上传列表 ====== */
.home-content {
	padding: 0 28rpx;
}

.upload-list {
	display: flex;
	flex-direction: column;
}

.upload-card {
	display: flex;
	align-items: center;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.upload-card:active {
	background: #f5f6fa;
}

.upload-icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.isbn-icon {
	background: #f5f6fa;
}

.no-isbn-icon {
	background: #f5f6fa;
}

.icon-emoji {
	font-size: 28rpx;
}

.upload-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.upload-title {
	font-size: 30rpx;
	color: #1d2129;
	font-weight: 500;
	margin-bottom: 8rpx;
	display: block;
}

.upload-desc {
	font-size: 24rpx;
	color: #86909c;
}

.upload-arrow {
	width: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow-text {
	font-size: 36rpx;
	color: #86909c;
}

/* ====== 我的页面 ====== */
.mine-content {
	padding: 0 28rpx;
}

.user-card {
	display: flex;
	align-items: center;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.user-avatar {
	width: 80rpx;
	height: 80rpx;
	background: #f5f6fa;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.avatar-emoji {
	font-size: 40rpx;
}

.user-info {
	flex: 1;
}

.user-name {
	font-size: 32rpx;
	color: #1d2129;
	font-weight: 600;
	display: block;
	margin-bottom: 8rpx;
}

.version-text {
	font-size: 24rpx;
	color: #86909c;
}

/* 功能列表 */
.menu-card {
	background: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 24rpx 28rpx;
	border-bottom: 1rpx solid #f0f2f5;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:active {
	background: #f5f6fa;
}

.menu-icon {
	font-size: 30rpx;
	margin-right: 16rpx;
}

.menu-title {
	flex: 1;
	font-size: 28rpx;
	color: #1d2129;
}

.menu-arrow-wrap {
	width: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.menu-arrow {
	font-size: 32rpx;
	color: #86909c;
}

/* 退出登录 */
.logout-btn {
	margin-top: 32rpx;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.logout-btn:active {
	background: #f5f6fa;
}

.logout-text {
	font-size: 28rpx;
	color: #f56c6c;
	font-weight: 500;
}

/* 返回功能入口 */
.back-entry {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24rpx 0;
	gap: 6rpx;
}

.back-entry-icon {
	font-size: 28rpx;
	color: #c9cdd4;
	line-height: 1;
}

.back-entry-text {
	font-size: 24rpx;
	color: #c9cdd4;
}

.back-entry:active {
	opacity: 0.5;
}

/* ====== 底部导航栏 ====== */
.tab-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background: #ffffff;
	display: flex;
	border-top: 1rpx solid #f0f2f5;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.tab-icon {
	font-size: 36rpx;
	margin-bottom: 4rpx;
}

.tab-text {
	font-size: 22rpx;
	color: #4e5969;
}

.tab-item.active .tab-text {
	color: #409eff;
	font-weight: 500;
}
</style>
