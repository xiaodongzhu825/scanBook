<template>
	<view class="entry-container">
		<!-- 页面标题 -->
		<view class="header">
			<text class="title">请选择您要使用的功能</text>
		</view>

		<!-- 功能入口列表 -->
		<view class="entry-list">
			<!-- 小程序上书 -->
			<view class="entry-item" @click="handleEntry('upload')">
				<view class="entry-icon upload-icon">
					<view class="icon-book"></view>
					<view class="icon-arrow"></view>
				</view>
				<view class="entry-content">
					<text class="entry-title">小程序上书</text>
					<text class="entry-desc">进入仓库后选择上书</text>
				</view>
				<view class="entry-arrow">
					<text class="arrow-icon">›</text>
				</view>
			</view>

			<!-- 孔网商品翻新 -->
			<view class="entry-item" @click="handleEntry('refresh')">
				<view class="entry-icon refresh-icon">
					<view class="icon-refresh-circle"></view>
					<view class="icon-refresh-arrow"></view>
				</view>
				<view class="entry-content">
					<text class="entry-title">孔网商品翻新</text>
					<text class="entry-desc">会员功能、支持商品翻新</text>
				</view>
				<view class="entry-arrow">
					<text class="arrow-icon">›</text>
				</view>
			</view>

			<!-- 仓库订单 -->
			<view class="entry-item" @click="handleEntry('order')">
				<view class="entry-icon order-icon">
					<view class="icon-order-box"></view>
					<view class="icon-order-lines">
						<view class="line line-1"></view>
						<view class="line line-2"></view>
						<view class="line line-3"></view>
					</view>
				</view>
				<view class="entry-content">
					<text class="entry-title">仓库订单</text>
					<text class="entry-desc">显示仓库订单</text>
				</view>
				<view class="entry-arrow">
					<text class="arrow-icon">›</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {}
	},

	onLoad() {
		// 设置页面标题
		uni.setNavigationBarTitle({
			title: '功能入口'
		})
	},

	methods: {
		handleEntry(type) {
			switch (type) {
				case 'upload':
					uni.navigateTo({
						url: '/pages/warehouse/warehouse'
					})
					break
				case 'refresh':
					uni.showToast({
						title: '孔网商品翻新',
						icon: 'none'
					})
					// TODO: 跳转到翻新页面
					// uni.navigateTo({
					// 	url: '/pages/refresh/refresh'
					// })
					break
				case 'order':
					uni.navigateTo({
						url: '/pages/order/order'
					})
					break
			}
		}
	}
}
</script>

<style>
.entry-container {
	min-height: 100vh;
	background: #f5f6fa;
	padding: 32rpx;
	box-sizing: border-box;
}

/* 页面标题 */
.header {
	padding: 40rpx 0 32rpx;
	text-align: center;
}

.title {
	font-size: 32rpx;
	color: #1d2129;
	font-weight: 500;
}

/* 功能入口列表 */
.entry-list {
	display: flex;
	flex-direction: column;
}

.entry-item {
	display: flex;
	align-items: center;
	background: #ffffff;
	border-radius: 12rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 图标区域 */
.entry-icon {
	width: 56rpx;
	height: 56rpx;
	margin-right: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

/* 上书图标 - 书本 */
.upload-icon {
	background: #f5f6fa;
	border-radius: 8rpx;
}

.icon-book {
	width: 28rpx;
	height: 32rpx;
	border: 2rpx solid #86909c;
	border-radius: 2rpx 6rpx 2rpx 2rpx;
	position: relative;
}

.icon-book::before {
	content: '';
	position: absolute;
	left: 4rpx;
	top: 4rpx;
	width: 2rpx;
	height: 24rpx;
	background: #86909c;
}

/* 翻新图标 - 刷新圆圈 */
.refresh-icon {
	background: #f5f6fa;
	border-radius: 8rpx;
}

.icon-refresh-circle {
	width: 28rpx;
	height: 28rpx;
	border: 2rpx solid #86909c;
	border-radius: 50%;
	position: absolute;
}

.icon-refresh-arrow {
	width: 8rpx;
	height: 8rpx;
	border-top: 2rpx solid #86909c;
	border-right: 2rpx solid #86909c;
	position: absolute;
	top: 12rpx;
	right: 14rpx;
	transform: rotate(45deg);
}

/* 订单图标 - 订单盒子 */
.order-icon {
	background: #f5f6fa;
	border-radius: 8rpx;
}

.icon-order-box {
	width: 28rpx;
	height: 24rpx;
	border: 2rpx solid #86909c;
	border-radius: 4rpx;
	position: relative;
}

.icon-order-lines {
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
}

.line {
	width: 16rpx;
	height: 2rpx;
	background: #86909c;
	margin-top: 4rpx;
}

.line-1 {
	margin-top: 0;
}

/* 内容区域 */
.entry-content {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.entry-title {
	font-size: 30rpx;
	color: #1d2129;
	font-weight: 500;
	margin-bottom: 8rpx;
}

.entry-desc {
	font-size: 24rpx;
	color: #86909c;
}

/* 箭头 */
.entry-arrow {
	width: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow-icon {
	font-size: 36rpx;
	color: #86909c;
}
</style>