<template>
	<view class="page-container">
		<!-- 筛选区域 -->
		<view class="filter-section">
			<view class="filter-card">
				<view class="filter-row">
					<view class="filter-item">
						<text class="filter-label">账号</text>
						<picker class="filter-picker" @change="handleAccountChange" :value="accountIndex" :range="accountList">
							<view class="picker-value">
								<text class="picker-text">{{ accountList[accountIndex] }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
					<view class="filter-item">
						<text class="filter-label">店铺</text>
						<picker class="filter-picker" @change="handleShopChange" :value="shopIndex" :range="shopList">
							<view class="picker-value">
								<text class="picker-text">{{ shopList[shopIndex] }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
				</view>
				<view class="filter-row">
					<view class="filter-item full-width">
						<text class="filter-label">日期</text>
						<picker class="filter-picker" mode="date" @change="handleDateChange" :value="selectedDate">
							<view class="picker-value">
								<text class="picker-text">{{ selectedDate }}</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
				</view>
			</view>
		</view>

		<!-- 统计信息 -->
		<view class="stats-section">
			<view class="stats-card">
				<text class="stats-icon">📊</text>
				<text class="stats-label">总记录数</text>
				<text class="stats-value">{{ recordList.length }} 条</text>
			</view>
		</view>

		<!-- 记录列表 -->
		<view class="record-list">
			<view class="record-item" v-for="(item, index) in recordList" :key="index">
				<view class="record-main">
					<!-- 图片 -->
					<view class="record-image" @click="previewImage(item.image)">
						<image class="book-image" :src="item.image" mode="aspectFill"></image>
						<view class="image-overlay">
							<text class="zoom-icon">🔍</text>
						</view>
					</view>
					<!-- 基本信息 -->
					<view class="record-info">
						<view class="info-row">
							<text class="book-name">{{ item.name }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">ISBN：</text>
							<text class="info-value">{{ item.isbn }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">品相：</text>
							<text class="condition-badge" :class="getConditionClass(item.condition)">{{ item.condition }}</text>
						</view>
						<view class="info-row">
							<text class="info-label">上书时间：</text>
							<text class="info-value">{{ item.uploadTime }}</text>
						</view>
					</view>
				</view>
				<!-- 价格和库存 -->
				<view class="record-detail">
					<view class="detail-row">
						<view class="detail-item">
							<text class="detail-label">库存</text>
							<text class="detail-value">{{ item.stock }}本</text>
						</view>
						<view class="detail-item">
							<text class="detail-label">价格</text>
							<text class="detail-value price">¥{{ item.price }}</text>
						</view>
					</view>
				</view>
				<!-- 发布状态 -->
				<view class="publish-status">
					<view class="status-row">
						<view class="status-item" :class="{ published: item.pddPublished }">
							<text class="status-icon">{{ item.pddPublished ? '✓' : '✗' }}</text>
							<text class="status-text">拼多多：{{ item.pddPublished ? '已发布' : '未发布' }}</text>
						</view>
						<view class="status-item" :class="{ published: item.kfzPublished }">
							<text class="status-icon">{{ item.kfzPublished ? '✓' : '✗' }}</text>
							<text class="status-text">孔夫子：{{ item.kfzPublished ? '已发布' : '未发布' }}</text>
						</view>
						<view class="status-item" :class="{ published: item.xianyuPublished }">
							<text class="status-icon">{{ item.xianyuPublished ? '✓' : '✗' }}</text>
							<text class="status-text">闲鱼：{{ item.xianyuPublished ? '已发布' : '未发布' }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-if="recordList.length === 0">
			<text class="empty-icon">📭</text>
			<text class="empty-text">暂无上书记录</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 筛选条件
			accountIndex: 0,
			accountList: ['全部账号', '账号A', '账号B', '账号C'],
			shopIndex: 0,
			shopList: ['全部店铺', '店铺1', '店铺2', '店铺3'],
			selectedDate: this.getTodayDate(),

			// 记录列表
			recordList: [
				{
					image: 'https://picsum.photos/200/280?random=1',
					name: '红楼梦',
					isbn: '9787020002207',
					condition: '全新',
					uploadTime: '2024-01-15 14:30',
					stock: 5,
					price: '45.00',
					pddPublished: true,
					kfzPublished: true,
					xianyuPublished: false
				},
				{
					image: 'https://picsum.photos/200/280?random=2',
					name: '西游记',
					isbn: '9787020002214',
					condition: '九成新',
					uploadTime: '2024-01-15 15:20',
					stock: 3,
					price: '38.00',
					pddPublished: true,
					kfzPublished: false,
					xianyuPublished: true
				},
				{
					image: 'https://picsum.photos/200/280?random=3',
					name: '水浒传',
					isbn: '9787020002221',
					condition: '八成新',
					uploadTime: '2024-01-15 16:45',
					stock: 2,
					price: '32.00',
					pddPublished: false,
					kfzPublished: true,
					xianyuPublished: true
				},
				{
					image: 'https://picsum.photos/200/280?random=4',
					name: '三国演义',
					isbn: '9787020002238',
					condition: '全新',
					uploadTime: '2024-01-15 17:10',
					stock: 8,
					price: '52.00',
					pddPublished: true,
					kfzPublished: true,
					xianyuPublished: true
				}
			]
		}
	},

	onLoad() {
		uni.setNavigationBarTitle({
			title: '上书记录'
		})
	},

	methods: {
		// 获取今天日期
		getTodayDate() {
			const today = new Date()
			const year = today.getFullYear()
			const month = String(today.getMonth() + 1).padStart(2, '0')
			const day = String(today.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		},

		// 账号筛选变化
		handleAccountChange(e) {
			this.accountIndex = e.detail.value
			this.filterRecords()
		},

		// 店铺筛选变化
		handleShopChange(e) {
			this.shopIndex = e.detail.value
			this.filterRecords()
		},

		// 日期筛选变化
		handleDateChange(e) {
			this.selectedDate = e.detail.value
			this.filterRecords()
		},

		// 筛选记录
		filterRecords() {
			// TODO: 根据筛选条件调用接口获取数据
			uni.showToast({
				title: '筛选条件已更新',
				icon: 'none'
			})
		},

		// 获取品相样式类
		getConditionClass(condition) {
			const classMap = {
				'全新': 'condition-new',
				'九成新': 'condition-good',
				'八成新': 'condition-fair',
				'七成新': 'condition-poor'
			}
			return classMap[condition] || 'condition-default'
		},

		// 预览图片
		previewImage(imageUrl) {
			uni.previewImage({
				urls: [imageUrl],
				current: imageUrl,
				longPressActions: {
					itemList: ['发送给朋友', '保存图片', '收藏']
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
	padding: 24rpx 28rpx;
	box-sizing: border-box;
}

/* 筛选区域 */
.filter-section {
	margin-bottom: 24rpx;
}

.filter-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 20rpx 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.filter-row {
	display: flex;
	gap: 20rpx;
	margin-bottom: 16rpx;
}

.filter-row:last-child {
	margin-bottom: 0;
}

.filter-item {
	flex: 1;
	display: flex;
	align-items: center;
}

.filter-item.full-width {
	flex: 1;
}

.filter-label {
	font-size: 26rpx;
	color: #4e5969;
	margin-right: 12rpx;
	white-space: nowrap;
}

.filter-picker {
	flex: 1;
}

.picker-value {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #f5f7fa;
	padding: 12rpx 16rpx;
	border-radius: 8rpx;
}

.picker-text {
	font-size: 26rpx;
	color: #1d2129;
}

.picker-arrow {
	font-size: 20rpx;
	color: #86909c;
}

/* 统计信息 */
.stats-section {
	margin-bottom: 24rpx;
}

.stats-card {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.stats-icon {
	font-size: 40rpx;
	margin-right: 16rpx;
}

.stats-label {
	font-size: 28rpx;
	color: #4e5969;
	flex: 1;
}

.stats-value {
	font-size: 36rpx;
	color: #1d2129;
	font-weight: 700;
}

/* 记录列表 */
.record-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.record-item {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.record-main {
	display: flex;
	gap: 20rpx;
	margin-bottom: 20rpx;
}

/* 图片区域 */
.record-image {
	width: 180rpx;
	height: 180rpx;
	border-radius: 12rpx;
	overflow: hidden;
	position: relative;
	flex-shrink: 0;
}

.book-image {
	width: 100%;
	height: 100%;
}

.image-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 60rpx;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.record-image:active .image-overlay {
	opacity: 1;
}

.zoom-icon {
	font-size: 28rpx;
}

/* 基本信息 */
.record-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.info-row {
	display: flex;
	align-items: center;
}

.book-name {
	font-size: 32rpx;
	color: #1d2129;
	font-weight: 600;
}

.info-label {
	font-size: 24rpx;
	color: #86909c;
}

.info-value {
	font-size: 24rpx;
	color: #4e5969;
}

.condition-badge {
	font-size: 22rpx;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	font-weight: 500;
}

.condition-new {
	background: #e1f3d8;
	color: #67c23a;
}

.condition-good {
	background: #d9ecff;
	color: #409eff;
}

.condition-fair {
	background: #faecd8;
	color: #e6a23c;
}

.condition-poor {
	background: #fde2e2;
	color: #f56c6c;
}

.condition-default {
	background: #f4f4f5;
	color: #909399;
}

/* 价格和库存 */
.record-detail {
	background: #f5f6fa;
	border-radius: 12rpx;
	padding: 16rpx 20rpx;
	margin-bottom: 16rpx;
}

.detail-row {
	display: flex;
	justify-content: space-around;
}

.detail-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6rpx;
}

.detail-label {
	font-size: 22rpx;
	color: #86909c;
}

.detail-value {
	font-size: 28rpx;
	color: #1d2129;
	font-weight: 600;
}

.detail-value.price {
	color: #f56c6c;
}

/* 发布状态 */
.publish-status {
	border-top: 1rpx solid #ebeef5;
	padding-top: 16rpx;
}

.status-row {
	display: flex;
	justify-content: space-between;
}

.status-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.status-icon {
	font-size: 20rpx;
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	background: #c0c4cc;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
}

.status-item.published .status-icon {
	background: #67c23a;
}

.status-text {
	font-size: 22rpx;
	color: #86909c;
}

.status-item.published .status-text {
	color: #67c23a;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #86909c;
}
</style>