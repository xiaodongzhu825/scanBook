<template>
	<view class="order-container">
		<!-- 统计栏 -->
		<view class="stats-bar">
			<text class="stats-text">订单总数：{{ totalCount }}</text>
		</view>

		<!-- 订单列表 -->
		<scroll-view class="order-list" scroll-y @scrolltolower="loadMore">
			<view 
				class="order-item" 
				v-for="(item, index) in orderList" 
				:key="index"
				@click="handleItemClick(item, index)"
			>
				<!-- 多选框 -->
				<view class="checkbox-wrapper" v-if="showBatchMode" @click.stop="toggleSelect(index)">
					<view :class="['checkbox', { checked: selectedItems.includes(index) }]">
						<text v-if="selectedItems.includes(index)" class="check-mark">✓</text>
					</view>
				</view>

				<!-- 商品图片 -->
				<image class="order-image" :src="item.image" mode="aspectFill"></image>

				<!-- 订单信息 -->
				<view class="order-info">
					<text class="order-name">{{ item.name }}</text>
					<view class="order-tags">
						<text class="tag new-code">新:{{ item.newCode }}</text>
						<text class="tag old-code">原:{{ item.oldCode }}</text>
					</view>
					<text class="order-isbn">ISBN: {{ item.isbn }}</text>
					<view class="status-row">
						<text :class="['status-tag', 'ship-' + item.shipStatus]">{{ item.shipStatusText }}</text>
						<text :class="['status-tag', 'out-' + item.outStatus]">{{ item.outStatusText }}</text>
					</view>
					<view class="time-row">
						<text class="ship-time">发货: {{ item.shipTime }}</text>
						<text class="create-time">{{ item.createTime }}</text>
					</view>
				</view>
			</view>

			<!-- 加载更多 -->
			<view class="load-more" v-if="loading">
				<text>加载中...</text>
			</view>
		</scroll-view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar" v-if="!showBatchMode">
			<view class="btn filter-btn" @click="showFilter = true">
				<text class="btn-icon">🔍</text>
				<text class="btn-text">筛选</text>
			</view>
			<view class="btn batch-btn" @click="enterBatchMode">
				<text class="btn-icon">📦</text>
				<text class="btn-text">批量出库</text>
			</view>
		</view>

		<!-- 批量操作栏 -->
		<view class="batch-bar" v-if="showBatchMode">
			<view class="batch-info">
				<text class="batch-count">已选择 {{ selectedItems.length }} 项</text>
			</view>
			<view class="batch-actions">
				<view class="btn cancel-btn" @click="cancelBatch">取消</view>
				<view class="btn confirm-btn" @click="confirmBatch">确定</view>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<view class="filter-mask" v-if="showFilter" @click="showFilter = false">
			<view class="filter-panel" @click.stop>
				<view class="filter-header">
					<text class="filter-title">筛选条件</text>
					<text class="close-btn" @click="showFilter = false">✕</text>
				</view>

				<scroll-view class="filter-body" scroll-y>
					<!-- 订单编号 -->
					<view class="filter-item">
						<text class="filter-label">订单编号</text>
						<input 
							class="filter-input" 
							v-model="filterForm.orderNo" 
							placeholder="请输入订单编号"
						/>
					</view>

					<!-- 店铺类型 -->
					<view class="filter-item">
						<text class="filter-label">店铺类型</text>
						<picker class="filter-picker" :value="filterForm.shopType" :range="shopTypeOptions" @change="onShopTypeChange">
							<view class="picker-value">
								<text>{{ shopTypeOptions[filterForm.shopType] || '请选择' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</picker>
					</view>

					<!-- 时间范围 -->
					<view class="filter-item">
						<text class="filter-label">时间范围</text>
						<picker class="filter-picker" :value="filterForm.timeRange" :range="timeRangeOptions" @change="onTimeRangeChange">
							<view class="picker-value">
								<text>{{ timeRangeOptions[filterForm.timeRange] || '请选择' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</picker>
					</view>

					<!-- 出库状态 -->
					<view class="filter-item">
						<text class="filter-label">出库状态</text>
						<picker class="filter-picker" :value="filterForm.outStatus" :range="outStatusOptions" @change="onOutStatusChange">
							<view class="picker-value">
								<text>{{ outStatusOptions[filterForm.outStatus] || '请选择' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</picker>
					</view>

					<!-- 发货状态 -->
					<view class="filter-item">
						<text class="filter-label">发货状态</text>
						<picker class="filter-picker" :value="filterForm.shipStatus" :range="shipStatusOptions" @change="onShipStatusChange">
							<view class="picker-value">
								<text>{{ shipStatusOptions[filterForm.shipStatus] || '请选择' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</picker>
					</view>

					<!-- 货号 -->
					<view class="filter-item">
						<text class="filter-label">货号</text>
						<input 
							class="filter-input" 
							v-model="filterForm.code" 
							placeholder="请输入货号"
						/>
					</view>

					<!-- 原货号 -->
					<view class="filter-item">
						<text class="filter-label">原货号</text>
						<input 
							class="filter-input" 
							v-model="filterForm.oldCode" 
							placeholder="请输入原货号"
						/>
					</view>

					<!-- ISBN -->
					<view class="filter-item">
						<text class="filter-label">ISBN</text>
						<input 
							class="filter-input" 
							v-model="filterForm.isbn" 
							placeholder="请输入ISBN"
						/>
					</view>

					<!-- 排序方式 -->
					<view class="filter-item">
						<text class="filter-label">排序方式</text>
						<picker class="filter-picker" :value="filterForm.sortType" :range="sortTypeOptions" @change="onSortTypeChange">
							<view class="picker-value">
								<text>{{ sortTypeOptions[filterForm.sortType] || '请选择' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</picker>
					</view>
				</scroll-view>

				<view class="filter-footer">
					<view class="btn filter-cancel" @click="showFilter = false">取消</view>
					<view class="btn filter-reset" @click="resetFilter">重置</view>
					<view class="btn filter-confirm" @click="confirmFilter">查询</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			totalCount: 128,
			loading: false,
			showBatchMode: false,
			selectedItems: [],
			showFilter: false,

			// 筛选选项
			shopTypeOptions: ['孔夫子', '闲鱼', '拼多多'],
			timeRangeOptions: ['24小时内', '48小时内', '48小时外'],
			outStatusOptions: ['全部', '未出库', '已出库'],
			shipStatusOptions: ['全部', '到付款', '待发货', '已发货待签收', '交易完成', '已退款', '交易关闭', '售后预处理'],
			sortTypeOptions: ['时间排序', '货号排序'],

			// 筛选表单
			filterForm: {
				orderNo: '',
				shopType: '',
				timeRange: '',
				outStatus: '',
				shipStatus: '',
				code: '',
				oldCode: '',
				isbn: '',
				sortType: ''
			},

			// 模拟订单数据
			orderList: [
				{
					image: '/static/books/book1.jpg',
					name: '红楼梦（精装版）',
					newCode: 'BK2024001',
					oldCode: 'OLD001',
					isbn: '978-7-101-00001-1',
					shipStatus: 'pending',
					shipStatusText: '待发货',
					outStatus: 'not_out',
					outStatusText: '未出库',
					shipTime: '24小时内',
					createTime: '刚刚'
				},
				{
					image: '/static/books/book2.jpg',
					name: '西游记（全四册）',
					newCode: 'BK2024002',
					oldCode: 'OLD002',
					isbn: '978-7-101-00002-2',
					shipStatus: 'shipped',
					shipStatusText: '已发货待签收',
					outStatus: 'out',
					outStatusText: '已出库',
					shipTime: '36小时内',
					createTime: '5分钟前'
				},
				{
					image: '/static/books/book3.jpg',
					name: '水浒传（上下册）',
					newCode: 'BK2024003',
					oldCode: 'OLD003',
					isbn: '978-7-101-00003-3',
					shipStatus: 'completed',
					shipStatusText: '交易完成',
					outStatus: 'out',
					outStatusText: '已出库',
					shipTime: '48小时内',
					createTime: '一天前'
				},
				{
					image: '/static/books/book4.jpg',
					name: '三国演义（珍藏版）',
					newCode: 'BK2024004',
					oldCode: 'OLD004',
					isbn: '978-7-101-00004-4',
					shipStatus: 'cod',
					shipStatusText: '到付款',
					outStatus: 'not_out',
					outStatusText: '未出库',
					shipTime: '24小时内',
					createTime: '2天前'
				},
				{
					image: '/static/books/book5.jpg',
					name: '论语译注',
					newCode: 'BK2024005',
					oldCode: 'OLD005',
					isbn: '978-7-101-00005-5',
					shipStatus: 'refunded',
					shipStatusText: '已退款',
					outStatus: 'out',
					outStatusText: '已出库',
					shipTime: '48小时内',
					createTime: '3个月前'
				}
			]
		}
	},

	onLoad() {
		uni.setNavigationBarTitle({
			title: '仓库订单'
		})
	},

	methods: {
		// 进入批量模式
		enterBatchMode() {
			this.showBatchMode = true
			this.selectedItems = []
		},

		// 取消批量
		cancelBatch() {
			this.showBatchMode = false
			this.selectedItems = []
		},

		// 确认批量出库
		confirmBatch() {
			if (this.selectedItems.length === 0) {
				uni.showToast({
					title: '请选择订单',
					icon: 'none'
				})
				return
			}
			uni.showModal({
				title: '确认出库',
				content: `确定要出库选中的 ${this.selectedItems.length} 个订单吗？`,
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '出库成功',
							icon: 'success'
						})
						this.cancelBatch()
					}
				}
			})
		},

		// 切换选中
		toggleSelect(index) {
			const pos = this.selectedItems.indexOf(index)
			if (pos > -1) {
				this.selectedItems.splice(pos, 1)
			} else {
				this.selectedItems.push(index)
			}
		},

		// 点击订单项
		handleItemClick(item, index) {
			if (this.showBatchMode) {
				this.toggleSelect(index)
			} else {
				// 查看订单详情
				uni.showToast({
					title: '查看订单: ' + item.name,
					icon: 'none'
				})
			}
		},

		// 筛选器变更
		onShopTypeChange(e) {
			this.filterForm.shopType = e.detail.value
		},
		onTimeRangeChange(e) {
			this.filterForm.timeRange = e.detail.value
		},
		onOutStatusChange(e) {
			this.filterForm.outStatus = e.detail.value
		},
		onShipStatusChange(e) {
			this.filterForm.shipStatus = e.detail.value
		},
		onSortTypeChange(e) {
			this.filterForm.sortType = e.detail.value
		},

		// 重置筛选
		resetFilter() {
			this.filterForm = {
				orderNo: '',
				shopType: '',
				timeRange: '',
				outStatus: '',
				shipStatus: '',
				code: '',
				oldCode: '',
				isbn: '',
				sortType: ''
			}
		},

		// 确认筛选
		confirmFilter() {
			uni.showToast({
				title: '筛选查询中...',
				icon: 'none'
			})
			this.showFilter = false
		},

		// 加载更多
		loadMore() {
			if (this.loading) return
			this.loading = true
			setTimeout(() => {
				this.loading = false
			}, 1000)
		}
	}
}
</script>

<style>
.order-container {
	min-height: 100vh;
	background: #f5f6fa;
	padding-bottom: 140rpx;
}

/* 统计栏 */
.stats-bar {
	background: #ffffff;
	padding: 32rpx;
	margin: 24rpx 24rpx 16rpx;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.stats-text {
	font-size: 30rpx;
	color: #1d2129;
	font-weight: 600;
	letter-spacing: 1rpx;
}

/* 订单列表 */
.order-list {
	height: calc(100vh - 280rpx);
	padding: 0 24rpx;
	box-sizing: border-box;
}

.order-item {
	display: flex;
	align-items: flex-start;
	background: #ffffff;
	padding: 28rpx;
	margin-bottom: 20rpx;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	box-sizing: border-box;
	width: 100%;
}

.order-item:active {
	box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.03);
}

/* 多选框 */
.checkbox-wrapper {
	padding-right: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.checkbox {
	width: 44rpx;
	height: 44rpx;
	border: 3rpx solid #dcdfe6;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.checkbox.checked {
	background: #409eff;
	border-color: #409eff;
}

.check-mark {
	color: #ffffff;
	font-size: 26rpx;
	font-weight: bold;
}

/* 商品图片 */
.order-image {
	width: 130rpx;
	height: 130rpx;
	border-radius: 12rpx;
	margin-right: 24rpx;
	background: #f0f2f5;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 订单信息 */
.order-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	overflow: hidden;
}

.order-name {
	font-size: 30rpx;
	color: #1d2129;
	font-weight: 600;
	margin-bottom: 16rpx;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.order-tags {
	display: flex;
	margin-bottom: 12rpx;
	flex-wrap: wrap;
}

.tag {
	font-size: 22rpx;
	padding: 6rpx 14rpx;
	border-radius: 20rpx;
	margin-right: 12rpx;
	margin-bottom: 8rpx;
	font-weight: 500;
}

.new-code {
	background: #ecf5ff;
	color: #409eff;
}

.old-code {
	background: #f0f9eb;
	color: #67c23a;
}

.order-isbn {
	font-size: 24rpx;
	color: #86909c;
	margin-bottom: 16rpx;
	font-weight: 400;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.status-row {
	display: flex;
	margin-bottom: 16rpx;
	flex-wrap: wrap;
}

.status-tag {
	font-size: 22rpx;
	padding: 6rpx 14rpx;
	border-radius: 20rpx;
	margin-right: 12rpx;
	margin-bottom: 8rpx;
	font-weight: 500;
}

.ship-pending { background: #fdf6ec; color: #e6a23c; }
.ship-shipped { background: #ecf5ff; color: #409eff; }
.ship-completed { background: #f0f9eb; color: #67c23a; }
.ship-cod { background: #f4f4f5; color: #606266; }
.ship-refunded { background: #fef0f0; color: #f56c6c; }

.out-not_out { background: #fdf6ec; color: #e6a23c; }
.out-out { background: #f0f9eb; color: #67c23a; }

.time-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 8rpx;
	border-top: 1rpx solid #e5e6eb;
}

.ship-time {
	font-size: 24rpx;
	color: #e6a23c;
	font-weight: 500;
}

.create-time {
	font-size: 24rpx;
	color: #86909c;
	font-weight: 400;
}

/* 底部操作栏 */
.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 110rpx;
	background: #ffffff;
	display: flex;
	border-top: 1rpx solid #e5e6eb;
}

.btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.btn:active {
	background: #f0f2f5;
}

.btn-icon {
	font-size: 36rpx;
	margin-right: 12rpx;
}

.btn-text {
	font-size: 30rpx;
	color: #606266;
	font-weight: 500;
}

.filter-btn {
	border-right: 1rpx solid #e5e6eb;
}

.batch-btn .btn-text {
	color: #409eff;
}

/* 批量操作栏 */
.batch-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #ffffff;
	border-top: 1rpx solid #e5e6eb;
	padding: 24rpx 32rpx;
}

.batch-info {
	text-align: center;
	margin-bottom: 24rpx;
}

.batch-count {
	font-size: 30rpx;
	color: #409eff;
	font-weight: 600;
}

.batch-actions {
	display: flex;
	gap: 24rpx;
}

.cancel-btn {
	flex: 1;
	height: 80rpx;
	background: #f5f6fa;
	border-radius: 12rpx;
	font-size: 30rpx;
	color: #4e5969;
	font-weight: 500;
	transition: all 0.2s ease;
}

.cancel-btn:active {
	background: #e5e6eb;
}

.confirm-btn {
	flex: 1;
	height: 80rpx;
	background: #409eff;
	border-radius: 12rpx;
	font-size: 30rpx;
	color: #ffffff;
	font-weight: 500;
	transition: all 0.2s ease;
}

.confirm-btn:active {
	background: #3a8ee6;
}

/* 筛选弹窗 */
.filter-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 999;
}

.filter-panel {
	width: 100%;
	max-width: 100vw;
	max-height: 85vh;
	background: #ffffff;
	border-radius: 32rpx 32rpx 0 0;
	display: flex;
	flex-direction: column;
	box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.08);
	box-sizing: border-box;
}

.filter-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 1rpx solid #e5e6eb;
	background: #ffffff;
}

.filter-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1d2129;
}

.close-btn {
	font-size: 40rpx;
	color: #909399;
	padding: 12rpx;
	transition: color 0.2s ease;
}

.close-btn:active {
	color: #606266;
}

.filter-body {
	flex: 1;
	max-height: 65vh;
	padding: 20rpx 24rpx;
	box-sizing: border-box;
	width: 100%;
}

.filter-item {
	margin-bottom: 20rpx;
	background: #ffffff;
	padding: 16rpx;
	border-radius: 12rpx;
	box-sizing: border-box;
	width: 100%;
}

.filter-label {
	font-size: 28rpx;
	color: #4e5969;
	margin-bottom: 16rpx;
	display: block;
	font-weight: 500;
}

.filter-input {
	height: 72rpx;
	background: #f5f6fa;
	border-radius: 10rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	color: #1d2129;
	border: 2rpx solid transparent;
	transition: all 0.2s ease;
	box-sizing: border-box;
	width: 100%;
}

.filter-input:focus {
	border-color: #409eff;
	background: #ffffff;
}

.filter-picker {
	height: 72rpx;
	background: #f5f6fa;
	border-radius: 10rpx;
	padding: 0 20rpx;
	display: flex;
	align-items: center;
	border: 2rpx solid transparent;
	transition: all 0.2s ease;
	box-sizing: border-box;
	width: 100%;
}

.filter-picker:active {
	background: #e5e6eb;
}

.picker-value {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 28rpx;
	color: #1d2129;
	width: 100%;
	overflow: hidden;
}

.picker-value text:first-child {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
}

.picker-arrow {
	font-size: 36rpx;
	color: #c9cdd4;
}

.filter-footer {
	display: flex;
	padding: 20rpx 24rpx;
	border-top: 1rpx solid #e5e6eb;
	gap: 16rpx;
	background: #ffffff;
}

.filter-cancel {
	flex: 1;
	height: 84rpx;
	background: #f5f6fa;
	border-radius: 16rpx;
	font-size: 30rpx;
	color: #4e5969;
	font-weight: 500;
	transition: all 0.2s ease;
}

.filter-cancel:active {
	background: #e5e6eb;
}

.filter-reset {
	flex: 1;
	height: 84rpx;
	background: #f5f6fa;
	border-radius: 16rpx;
	font-size: 30rpx;
	color: #4e5969;
	font-weight: 500;
	transition: all 0.2s ease;
}

.filter-reset:active {
	background: #e5e6eb;
}

.filter-confirm {
	flex: 1;
	height: 84rpx;
	background: #409eff;
	border-radius: 16rpx;
	font-size: 30rpx;
	color: #ffffff;
	font-weight: 500;
	transition: all 0.2s ease;
}

.filter-confirm:active {
	background: #3a8ee6;
}

.load-more {
	text-align: center;
	padding: 20rpx;
	color: #86909c;
	font-size: 24rpx;
}
</style>