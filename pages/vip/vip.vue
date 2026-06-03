<template>
	<view class="page-container">
		<!-- 页面标题 -->
		<view class="header-section">
			<view class="header-card">
				<text class="header-icon">👑</text>
				<text class="header-title">选择适合您的会员等级</text>
				<text class="header-desc">享受到更多专属权益</text>
			</view>
		</view>

		<!-- 已开通会员 -->
		<view class="active-vip-section" v-if="hasActiveVip">
			<view class="section-header-row">
				<text class="section-icon-small">✨</text>
				<text class="section-title">已开通会员</text>
			</view>

			<!-- 手机版上书会员 -->
			<view class="active-card mobile-active" v-if="activeMobileVip">
				<view class="active-header">
					<view class="active-name-row">
						<text class="active-icon">📱</text>
						<text class="active-name">手机版上书会员</text>
					</view>
					<text class="active-badge">已开通</text>
				</view>
				<view class="active-info">
					<view class="info-row">
						<text class="info-label">已上书本数</text>
						<text class="info-value">{{ activeMobileVip.uploadCount }}本</text>
					</view>
					<view class="info-row">
						<text class="info-label">到期时间</text>
						<text class="info-value">{{ activeMobileVip.expireDate }}</text>
					</view>
					<view class="info-row highlight">
						<text class="info-label">剩余天数</text>
						<text class="info-value days">{{ activeMobileVip.remainingDays }}天</text>
					</view>
				</view>
			</view>

			<!-- 孔网翻新会员 -->
			<view class="active-card refresh-active" v-if="activeRefreshVip">
				<view class="active-header">
					<view class="active-name-row">
						<text class="active-icon">🔄</text>
						<text class="active-name">孔网翻新会员</text>
					</view>
					<text class="active-badge">已开通</text>
				</view>
				<view class="active-info">
					<view class="info-row">
						<text class="info-label">到期时间</text>
						<text class="info-value">{{ activeRefreshVip.expireDate }}</text>
					</view>
					<view class="info-row highlight">
						<text class="info-label">剩余天数</text>
						<text class="info-value days">{{ activeRefreshVip.remainingDays }}天</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 会员选择 -->
		<view class="vip-options">
			<view class="section-header-row">
				<text class="section-icon-small">💎</text>
				<text class="section-title">选择会员</text>
			</view>

			<!-- 手机版上书会员 -->
			<view class="vip-section">
				<view class="section-header">
					<text class="section-icon">📱</text>
					<view class="section-name-box">
						<text class="section-name">手机版上书会员</text>
						<text class="section-desc">适合经常上架书籍的用户</text>
					</view>
				</view>

				<view class="vip-cards">
					<!-- 月付会员 -->
					<view
						class="vip-card"
						:class="{ selected: selectedVip === 'mobile-month' }"
						@click="selectVip('mobile-month')"
					>
						<view class="card-header">
							<view class="card-title-box">
								<text class="card-title">月付会员</text>
								<text class="card-period">/月</text>
							</view>
							<view class="price-box">
								<text class="price-symbol">¥</text>
								<text class="card-price">29.9</text>
							</view>
						</view>
						<view class="card-features">
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">每月上传书籍数量增加</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">优先展示您的商品</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">专属客服服务</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">月度VIP标识</text>
							</view>
						</view>
						<view class="select-indicator" v-if="selectedVip === 'mobile-month'">
							<text class="indicator-icon">✓</text>
						</view>
					</view>

					<!-- 年度会员 -->
				<view
					class="vip-card recommended"
					:class="{ selected: selectedVip === 'mobile-year' }"
					@click="selectVip('mobile-year')"
				>
					<view class="card-header">
						<view class="card-title-box">
							<text class="card-title">年度会员</text>
							<text class="recommend-badge-inline">
								<text class="badge-icon">🔥</text>
								<text class="badge-text">推荐</text>
							</text>
							<text class="card-period">/年</text>
						</view>
						<view class="price-box">
							<text class="price-symbol">¥</text>
							<text class="card-price">299</text>
						</view>
					</view>
						<view class="save-badge">省¥59.8</view>
						<view class="card-features">
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text highlight">无限制上传书籍数量</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">优先展示您的商品</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">24小时专属客服服务</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">年度专属VIP标识</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">更多增值服务特权</text>
							</view>
						</view>
						<view class="select-indicator" v-if="selectedVip === 'mobile-year'">
							<text class="indicator-icon">✓</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 孔网翻新会员 -->
			<view class="vip-section">
				<view class="section-header">
					<text class="section-icon">🔄</text>
					<view class="section-name-box">
						<text class="section-name">孔网翻新会员</text>
						<text class="section-desc">适合批量处理商品的用户</text>
					</view>
				</view>

				<view class="vip-cards">
					<view
						class="vip-card"
						:class="{ selected: selectedVip === 'refresh-month' }"
						@click="selectVip('refresh-month')"
					>
						<view class="card-header">
							<view class="card-title-box">
								<text class="card-title">翻新会员</text>
								<text class="card-period">/月</text>
							</view>
							<view class="price-box">
								<text class="price-symbol">¥</text>
								<text class="card-price">49.9</text>
							</view>
						</view>
						<view class="card-features">
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text highlight">无限制使用翻新功能</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">批量处理商品信息</text>
							</view>
							<view class="feature-item">
								<text class="feature-dot">✓</text>
								<text class="feature-text">优先获得新功能体验</text>
							</view>
						</view>
						<view class="select-indicator" v-if="selectedVip === 'refresh-month'">
							<text class="indicator-icon">✓</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部支付按钮 -->
		<view class="pay-section">
			<view class="pay-btn" :class="{ disabled: !selectedVip }" @click="handlePay">
				<text class="pay-text">{{ selectedVip ? '立即支付' : '请选择会员类型' }}</text>
				<text class="pay-price" v-if="selectedVip">{{ getSelectedPrice }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			selectedVip: '',
			// 模拟已开通会员数据
			hasActiveVip: true,
			activeMobileVip: {
				uploadCount: 128,
				expireDate: '2024-12-31',
				remainingDays: 180
			},
			activeRefreshVip: {
				expireDate: '2024-08-15',
				remainingDays: 45
			}
		}
	},

	computed: {
		getSelectedPrice() {
			const prices = {
				'mobile-month': '¥29.9',
				'mobile-year': '¥299',
				'refresh-month': '¥49.9'
			}
			return prices[this.selectedVip] || ''
		},

		getSelectedVipInfo() {
			const vipInfo = {
				'mobile-month': { name: '手机版上书会员 - 月付会员', price: '¥29.9' },
				'mobile-year': { name: '手机版上书会员 - 年度会员', price: '¥299' },
				'refresh-month': { name: '孔网翻新会员 - 月付会员', price: '¥49.9' }
			}
			return vipInfo[this.selectedVip] || { name: '', price: '' }
		}
	},

	onLoad() {
		uni.setNavigationBarTitle({
			title: '会员等级选择'
		})
	},

	methods: {
		selectVip(type) {
			this.selectedVip = type
		},

		handlePay() {
			if (!this.selectedVip) {
				uni.showToast({
					title: '请选择会员类型',
					icon: 'none'
				})
				return
			}

			const vipInfo = this.getSelectedVipInfo
			uni.showModal({
				title: '确认支付',
				content: `会员类型：${vipInfo.name}\n支付金额：${vipInfo.price}`,
				confirmText: '确认支付',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						})
					}
				}
			})
		}
	}
}
</script>

<style>
.page-container {
	min-height: 100vh;
	background: #f5f6fa;
	padding: 24rpx 28rpx 160rpx;
	box-sizing: border-box;
}

/* 页面标题 */
.header-section {
	margin-bottom: 28rpx;
}

.header-card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 36rpx 28rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	text-align: center;
	position: relative;
	overflow: hidden;
}

.header-icon {
	font-size: 48rpx;
	display: block;
	margin-bottom: 12rpx;
}

.header-title {
	font-size: 34rpx;
	color: #1d2129;
	font-weight: 600;
	display: block;
	margin-bottom: 8rpx;
}

.header-desc {
	font-size: 24rpx;
	color: #909399;
}

/* 区块标题 */
.section-header-row {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
	padding: 0 4rpx;
}

.section-icon-small {
	font-size: 28rpx;
	margin-right: 8rpx;
}

.section-title {
	font-size: 30rpx;
	color: #303133;
	font-weight: 600;
}

/* 已开通会员 */
.active-vip-section {
	margin-bottom: 32rpx;
}

.active-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	border-left: 6rpx solid #409eff;
	position: relative;
}

.active-card.refresh-active {
	border-left-color: #67c23a;
}

.active-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.active-name-row {
	display: flex;
	align-items: center;
}

.active-icon {
	font-size: 32rpx;
	margin-right: 12rpx;
}

.active-name {
	font-size: 30rpx;
	color: #303133;
	font-weight: 600;
}

.active-badge {
	background: #67c23a;
	color: #ffffff;
	font-size: 22rpx;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	font-weight: 500;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.active-info {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.info-label {
	font-size: 26rpx;
	color: #909399;
}

.info-value {
	font-size: 26rpx;
	color: #606266;
	font-weight: 500;
}

.info-value.days {
	color: #e6a23c;
	font-weight: 600;
}

.info-row.highlight .info-label {
	color: #e6a23c;
}

/* 会员选择 */
.vip-options {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.vip-section {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.section-header {
	display: flex;
	align-items: flex-start;
	margin-bottom: 20rpx;
	padding-bottom: 16rpx;
	border-bottom: 2rpx solid #f0f2f5;
}

.section-icon {
	font-size: 40rpx;
	margin-right: 16rpx;
	background: #f0f5ff;
	width: 72rpx;
	height: 72rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.section-name-box {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.section-name {
	font-size: 32rpx;
	color: #303133;
	font-weight: 600;
	margin-bottom: 4rpx;
}

.section-desc {
	font-size: 24rpx;
	color: #909399;
}

.vip-cards {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.vip-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	border: 3rpx solid #ebeef5;
	transition: all 0.25s ease;
	position: relative;
}

.vip-card:active {
	transform: scale(0.98);
}

.vip-card.selected {
	border-color: #409eff;
	background: #ffffff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.vip-card.recommended {
	background: #ffffff;
	border-color: #ebeef5;
}

.vip-card.recommended.selected {
	border-color: #409eff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.recommend-badge-inline {
	background: #e6a23c;
	color: #ffffff;
	font-size: 18rpx;
	padding: 4rpx 10rpx;
	border-radius: 12rpx;
	font-weight: 500;
	margin-left: 8rpx;
	margin-right: 4rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.badge-icon {
	font-size: 18rpx;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.card-title-box {
	display: flex;
	align-items: baseline;
}

.card-title {
	font-size: 30rpx;
	color: #303133;
	font-weight: 600;
}

.card-period {
	font-size: 24rpx;
	color: #909399;
	margin-left: 4rpx;
}

.price-box {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 24rpx;
	color: #f56c6c;
	font-weight: 600;
}

.card-price {
	font-size: 44rpx;
	color: #f56c6c;
	font-weight: 700;
}

.save-badge {
	display: inline-block;
	background: #f56c6c;
	color: #ffffff;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	margin-bottom: 12rpx;
	font-weight: 500;
}

.card-features {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.feature-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.feature-dot {
	font-size: 22rpx;
	color: #67c23a;
	font-weight: 600;
}

.feature-text {
	font-size: 26rpx;
	color: #606266;
}

.feature-text.highlight {
	color: #409eff;
	font-weight: 500;
}

.select-indicator {
	position: absolute;
	bottom: 16rpx;
	right: 16rpx;
	width: 40rpx;
	height: 40rpx;
	background: #409eff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.vip-card.recommended .select-indicator {
	background: #409eff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.indicator-icon {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: 700;
}

/* 底部支付 */
.pay-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #ffffff;
	padding: 24rpx 28rpx;
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.pay-btn {
	background: #409eff;
	border-radius: 16rpx;
	padding: 28rpx 0;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	transition: all 0.2s ease;
}

.pay-btn.disabled {
	background: #c0c4cc;
	box-shadow: none;
}

.pay-btn:active:not(.disabled) {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.pay-text {
	font-size: 32rpx;
	color: #ffffff;
	font-weight: 600;
}

.pay-price {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.95);
	background: rgba(255, 255, 255, 0.2);
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
}
</style>