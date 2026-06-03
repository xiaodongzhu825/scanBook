<template>
	<view class="page-container">
		<!-- Element 风格 Tabs 标签栏 -->
		<view class="wh-tabs-wrapper">
			<scroll-view scroll-x class="wh-tabs-scroll" :show-scrollbar="false">
				<view class="wh-tabs">
					<!-- 加载中 -->
					<view class="wh-tabs-loading" v-if="isLoadingWarehouse">
						<view class="mini-spinner"></view>
					</view>
					<template v-else>
						<view
							class="wh-tab"
							v-for="item in warehouseList"
							:key="item.id"
							:class="{ active: selectedWarehouse && selectedWarehouse.id === item.id }"
							@click="selectWarehouse(item)"
						>
							<text class="wh-tab-text">{{ item.name }}</text>
						</view>
					</template>
					<view class="wh-tab-empty" v-if="!isLoadingWarehouse && warehouseList.length === 0">
						<text class="wh-tab-empty-text">暂无仓库</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 搜索栏 -->
		<view class="wh-search-bar">
			<view class="wh-search-box">
				<text class="wh-search-icon">🔍</text>
				<input class="wh-search-input" v-model="searchKeyword" placeholder="搜索货位编号" @input="onSearchInput" confirm-type="search" @confirm="doSearch" />
				<text class="wh-search-clear" v-if="searchKeyword" @click="clearSearch">✕</text>
				<view class="wh-scan-btn" @click="handleScan">
					<text class="wh-scan-icon">📷</text>
				</view>
			</view>
		</view>

		<!-- 内容区：货位列表 -->
		<view class="wh-location-scroll">
			<!-- 加载中 -->
			<view class="wh-loading-block" v-if="isLoadingLocation">
				<view class="loading-spinner"></view>
				<text class="wh-loading-text">加载货位...</text>
			</view>

			<scroll-view
				v-if="!isLoadingLocation"
				class="wh-scroll-view"
				scroll-y
				@scrolltolower="loadMoreLocation"
				:show-scrollbar="false"
				:lower-threshold="50"
				refresher-enabled
				:refresher-triggered="isRefreshing"
				@refresherrefresh="onRefresh"
			>
				<view class="wh-location-grid">
					<view
						class="wh-location-cell"
						v-for="item in locationList"
						:key="item.id"
						@click="selectLocation(item)"
					>
						<view class="wh-cell-icon">
							<text class="wh-cell-emoji">📍</text>
						</view>
						<view class="wh-cell-info">
							<text class="wh-cell-code">{{ item.code }}</text>
							<text class="wh-cell-name">{{ item.name }}</text>
						</view>
						<text class="wh-cell-arrow">›</text>
					</view>

					<!-- 加载更多 -->
					<view class="wh-load-more" v-if="isLoadingMore">
						<view class="mini-spinner"></view>
						<text class="wh-load-more-text">加载更多...</text>
					</view>

					<!-- 没有更多 -->
					<view class="wh-load-more" v-if="!locationHasMore && locationList.length > 0">
						<text class="wh-no-more-text">— 已全部加载 —</text>
					</view>

					<!-- 无货位 -->
					<view class="wh-empty-block" v-if="locationList.length === 0 && !isLoadingMore">
						<text class="wh-empty-text">该仓库暂无货位</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 扫码结果弹窗 -->
		<view class="wh-dialog-mask" v-if="showScanDialog" @click="showScanDialog = false">
			<view class="wh-dialog-box" @click.stop>
				<text class="wh-dialog-title">扫码识别结果</text>
				<view class="wh-dialog-body">
					<text class="wh-dialog-label">原始内容：</text>
					<text class="wh-dialog-value">{{ scanResult }}</text>
				</view>
				<view class="wh-dialog-footer">
					<text class="wh-dialog-btn cancel" @click="showScanDialog = false">关闭</text>
					<text class="wh-dialog-btn" @click="onScanConfirm">搜索货位</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getWarehouseList, getLocationList } from '@/utils/api.js'

export default {
	data() {
		return {
			selectedWarehouse: null,
			warehouseList: [],
			locationList: [],
			isLoadingWarehouse: false,
			isLoadingLocation: false,
			locationPage: 1,
			locationPageSize: 20,
			locationHasMore: true,
			isLoadingMore: false,
			isRefreshing: false,
			searchKeyword: '',
			scanResult: '',
			showScanDialog: false
		}
	},

	onLoad() {
		uni.setNavigationBarTitle({ title: '选择仓库货架' })
		this.loadWarehouseList()
	},

	methods: {
		async loadWarehouseList() {
			this.isLoadingWarehouse = true
			try {
				const res = await getWarehouseList({ status: 1, page: 1, page_size: 100 })
				if (res.code === 0 && res.data && res.data.list) {
					this.warehouseList = res.data.list
					// 默认选中第一个仓库
					if (this.warehouseList.length > 0) {
						this.selectedWarehouse = this.warehouseList[0]
						this.loadLocationList(this.selectedWarehouse.id)
					}
				} else {
					uni.showToast({ title: res.msg || '获取仓库列表失败', icon: 'none' })
				}
			} catch (e) {
				uni.showToast({ title: '网络请求失败', icon: 'none' })
			} finally {
				this.isLoadingWarehouse = false
			}
		},

		async loadLocationList(warehouseId, keyword) {
			this.isLoadingLocation = true
			this.locationPage = 1
			this.locationHasMore = true
			try {
				const params = {
					warehouse_id: warehouseId, type: 1, status: 1,
					page: 1, page_size: this.locationPageSize
				}
				if (keyword) params.code = keyword
				const res = await getLocationList(params)
				if (res.code === 0 && res.data && res.data.list) {
					this.locationList = res.data.list
					const total = res.data.total || 0
					this.locationHasMore = this.locationPage * this.locationPageSize < total
				} else {
					this.locationList = []
					this.locationHasMore = false
				}
			} catch (e) {
				this.locationList = []
				this.locationHasMore = false
			} finally {
				this.isLoadingLocation = false
			}
		},

		async loadMoreLocation() {
			if (!this.selectedWarehouse || !this.locationHasMore || this.isLoadingMore) return
			this.isLoadingMore = true
			this.locationPage++
			try {
				const params = {
					warehouse_id: this.selectedWarehouse.id, type: 1, status: 1,
					page: this.locationPage, page_size: this.locationPageSize
				}
				if (this.searchKeyword) params.code = this.searchKeyword
				const res = await getLocationList(params)
				if (res.code === 0 && res.data && res.data.list) {
					const newList = res.data.list
					if (newList.length === 0) {
						this.locationHasMore = false
					} else {
						this.locationList = [...this.locationList, ...newList]
						const total = res.data.total || 0
						this.locationHasMore = this.locationPage * this.locationPageSize < total
					}
				} else {
					this.locationHasMore = false
				}
			} catch (e) {
				this.locationPage--
			} finally {
				this.isLoadingMore = false
			}
		},

		selectWarehouse(item) {
			this.selectedWarehouse = item
			this.loadLocationList(item.id, this.searchKeyword)
		},

		// 下拉刷新
		async onRefresh() {
			this.isRefreshing = true
			this.locationPage = 1
			this.locationHasMore = true
			try {
				const params = {
					warehouse_id: this.selectedWarehouse.id, type: 1, status: 1,
					page: 1, page_size: this.locationPageSize
				}
				if (this.searchKeyword) params.code = this.searchKeyword
				const res = await getLocationList(params)
				if (res.code === 0 && res.data && res.data.list) {
					this.locationList = res.data.list
					const total = res.data.total || 0
					this.locationHasMore = this.locationPage * this.locationPageSize < total
				} else {
					this.locationList = []
					this.locationHasMore = false
				}
			} catch (e) {
				//
			} finally {
				this.isRefreshing = false
			}
		},

		selectLocation(item) {
			const data = {
				warehouseId: this.selectedWarehouse.id,
				warehouseName: this.selectedWarehouse.name,
				warehouseCode: this.selectedWarehouse.code,
				locationId: item.id,
				locationName: item.name,
				locationCode: item.code
			}
			uni.setStorageSync('selectedWarehouseData', data)
			uni.redirectTo({ url: '/pages/home/home' })
		},

		// 搜索输入（带防抖）
		onSearchInput(e) {
			if (this._searchTimer) clearTimeout(this._searchTimer)
			this._searchTimer = setTimeout(() => {
				this.doSearch()
			}, 400)
		},

		// 执行搜索
		doSearch() {
			if (this.selectedWarehouse) {
				this.loadLocationList(this.selectedWarehouse.id, this.searchKeyword.trim())
			}
		},

		// 清除搜索
		clearSearch() {
			this.searchKeyword = ''
			if (this.selectedWarehouse) {
				this.loadLocationList(this.selectedWarehouse.id)
			}
		},

		// 扫码识别货位号
		handleScan() {
			uni.scanCode({
				onlyFromCamera: false,
				success: (res) => {
					this.scanResult = (res.result || '').trim()
					this.showScanDialog = true
				},
				fail: () => {
					uni.showToast({ title: '扫码取消或失败', icon: 'none' })
				}
			})
		},

		// 扫码确认搜索（提取##后的内容）
		onScanConfirm() {
			this.showScanDialog = false
			if (this.scanResult) {
				const parts = this.scanResult.split('##')
				const code = parts.length > 1 ? parts[parts.length - 1] : this.scanResult
				this.searchKeyword = code
				this.doSearch()
			}
		}
	}
}
</script>

<style>
.page-container {
	height: 100vh;
	background: #f5f6fa;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* ====== Element 风格 Tabs 标签栏 ====== */
.wh-tabs-wrapper {
	background: #ffffff;
	border-bottom: 2rpx solid #e5e6eb;
	flex-shrink: 0;
}

.wh-tabs-scroll {
	width: 100%;
	white-space: nowrap;
}

.wh-tabs {
	display: inline-flex;
	padding: 0 28rpx;
}

.wh-tabs-loading {
	display: inline-flex;
	align-items: center;
	padding: 20rpx 0;
}

.wh-tab {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	padding: 0 24rpx;
	position: relative;
	flex-shrink: 0;
	cursor: pointer;
}

.wh-tab::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 0;
	height: 4rpx;
	background: #409eff;
	border-radius: 2rpx;
	transition: width 0.25s;
}

.wh-tab.active::after {
	width: 48rpx;
}

.wh-tab-text {
	font-size: 28rpx;
	color: #4e5969;
	white-space: nowrap;
	transition: color 0.2s;
}

.wh-tab.active .wh-tab-text {
	color: #409eff;
	font-weight: 600;
}

.wh-tab-empty {
	display: inline-flex;
	align-items: center;
	padding: 20rpx 0;
}

.wh-tab-empty-text {
	font-size: 26rpx;
	color: #86909c;
}

/* ====== 搜索栏 ====== */
.wh-search-bar {
	padding: 20rpx 28rpx 12rpx;
	flex-shrink: 0;
}

.wh-search-box {
	display: flex;
	align-items: center;
	background: #ffffff;
	border: 2rpx solid #e5e6eb;
	border-radius: 16rpx;
	padding: 0 20rpx;
	height: 72rpx;
	transition: border-color 0.2s, box-shadow 0.2s;
}

.wh-search-box:focus-within {
	border-color: #409eff;
	box-shadow: 0 0 0 4rpx rgba(64,158,255,0.08);
}

.wh-search-icon {
	font-size: 28rpx;
	margin-right: 16rpx;
	flex-shrink: 0;
	color: #c9cdd4;
}

.wh-search-box:focus-within .wh-search-icon {
	color: #409eff;
}

.wh-search-input {
	flex: 1;
	font-size: 28rpx;
	color: #1d2129;
	background: transparent;
	border: none;
	height: 100%;
	padding: 0;
	outline: none;
}

.wh-search-input::placeholder {
	color: #c9cdd4;
	font-size: 26rpx;
}

.wh-search-clear {
	font-size: 28rpx;
	color: #c9cdd4;
	padding: 8rpx 4rpx 8rpx 16rpx;
	flex-shrink: 0;
}

.wh-scan-btn {
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 8rpx;
	border-radius: 12rpx;
	background: #f5f6fa;
	flex-shrink: 0;
	transition: background 0.2s;
}

.wh-scan-btn:active {
	background: #e5e6eb;
}

.wh-scan-icon {
	font-size: 28rpx;
}

/* ====== 扫码结果弹窗 ====== */
.wh-dialog-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0,0,0,0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.wh-dialog-box {
	width: 560rpx;
	background: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx 36rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.wh-dialog-title {
	font-size: 32rpx;
	color: #1d2129;
	font-weight: 600;
	margin-bottom: 24rpx;
}

.wh-dialog-body {
	width: 100%;
	background: #f5f6fa;
	border-radius: 12rpx;
	padding: 24rpx 20rpx;
	margin-bottom: 32rpx;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.wh-dialog-label {
	font-size: 24rpx;
	color: #86909c;
}

.wh-dialog-value {
	font-size: 30rpx;
	color: #1d2129;
	font-weight: 600;
	word-break: break-all;
	line-height: 1.5;
}

.wh-dialog-footer {
	width: 100%;
	display: flex;
	gap: 16rpx;
}

.wh-dialog-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	background: #409eff;
	color: #ffffff;
	font-size: 30rpx;
	font-weight: 500;
	border-radius: 12rpx;
}

.wh-dialog-btn.cancel {
	background: #f5f6fa;
	color: #4e5969;
}

.wh-dialog-btn:active {
	opacity: 0.85;
}

/* ====== 内容区 ====== */
.wh-location-scroll {
	flex: 1;
	min-height: 0;
	overflow: hidden;
}

.wh-scroll-view {
	height: 100%;
}

.wh-loading-block {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 160rpx 0;
}

.wh-loading-text {
	font-size: 26rpx;
	color: #86909c;
	margin-top: 20rpx;
}

.wh-location-grid {
	padding: 20rpx 28rpx 12rpx;
}

/* ====== 货位单元格 ====== */
.wh-location-cell {
	display: flex;
	align-items: center;
	padding: 22rpx 24rpx;
	background: #ffffff;
	border-radius: 12rpx;
	margin-bottom: 12rpx;
	border: 2rpx solid #f0f2f5;
	transition: all 0.15s;
}

.wh-location-cell:active {
	background: #f5f6fa;
	border-color: #409eff;
}

.wh-cell-icon {
	width: 56rpx;
	height: 56rpx;
	background: #f5f6fa;
	border-radius: 14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 18rpx;
	flex-shrink: 0;
}

.wh-cell-emoji {
	font-size: 28rpx;
}

.wh-cell-info {
	flex: 1;
	min-width: 0;
}

.wh-cell-code {
	font-size: 28rpx;
	color: #1d2129;
	font-weight: 600;
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.wh-cell-name {
	font-size: 22rpx;
	color: #86909c;
	display: block;
	margin-top: 4rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.wh-cell-arrow {
	font-size: 32rpx;
	color: #c9cdd4;
	margin-left: 12rpx;
	flex-shrink: 0;
}

/* ====== 加载更多 ====== */
.wh-load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24rpx 0 8rpx;
	gap: 10rpx;
}

.wh-load-more-text {
	font-size: 24rpx;
	color: #86909c;
}

.wh-no-more-text {
	font-size: 22rpx;
	color: #c9cdd4;
}

/* ====== 空状态 ====== */
.wh-empty-block {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.wh-empty-text {
	font-size: 26rpx;
	color: #c9cdd4;
}

/* ====== 公用组件 ====== */
.mini-spinner {
	width: 28rpx;
	height: 28rpx;
	border: 3rpx solid #e4e7ed;
	border-top-color: #409eff;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

.loading-spinner {
	width: 56rpx;
	height: 56rpx;
	border: 4rpx solid #e4e7ed;
	border-top-color: #409eff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>
