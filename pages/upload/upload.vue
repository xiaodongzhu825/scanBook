<template>
	<view class="page-container">
		<!-- Tab切换 -->
		<view class="tab-header">
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'isbn' }"
				@click="switchTab('isbn')"
			>
				<text class="tab-text">ISBN上传</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'no-isbn' }"
				@click="switchTab('no-isbn')"
			>
				<text class="tab-text">无ISBN上传</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: currentTab === 'settings' }"
				@click="switchTab('settings')"
			>
				<text class="tab-text">⚙️</text>
			</view>
		</view>

		<swiper class="tab-swiper" :current="swiperIndex" @change="onTabSwiperChange">
			<!-- ISBN上传内容 -->
			<swiper-item>
				<view class="tab-content">
					<scroll-view class="content-scroll" scroll-y="true">
						<!-- 货区 & ISBN -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">货区 & ISBN</text>
							</view>
							<view class="inline-fields" style="flex:1;">
								<view class="inline-field narrow">
									<view class="picker-box" style="flex:1;" @click="openWarehousePicker('isbn')">
										<text class="picker-value">{{ isbnSelectedArea || '请选择货区' }}</text>
										<text class="picker-arrow">›</text>
									</view>
								</view>
								<view class="inline-field">
									<view class="isbn-input-box" style="flex:1;">
										<input class="isbn-input" v-model="isbn" placeholder="ISBN或扫码" maxlength="13"/>
										<view class="scan-btn" @click="scanISBN">
											<text class="scan-icon">📷</text>
										</view>
										<view class="search-btn" @click="searchISBN">
											<text class="search-text">搜</text>
										</view>
									</view>
								</view>
							</view>
						</view>

						<!-- 书名 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">书名</text>
							</view>
							<input class="form-input" v-model="bookName" placeholder="请输入书名"/>
						</view>

						<!-- 作者 & 出版社 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">作者 & 出版社</text>
							</view>
							<view class="inline-fields" style="flex:1;">
								<view class="inline-field">
									<input class="form-input" v-model="author" placeholder="作者" style="flex:1;"/>
								</view>
								<view class="inline-field">
									<input class="form-input" v-model="publisher" placeholder="出版社" style="flex:1;"/>
								</view>
							</view>
						</view>

						<!-- 定价 & 印刷时间 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">定价 & 印刷时间</text>
							</view>
							<view class="inline-fields" style="flex:1;">
								<view class="inline-field">
									<view class="price-input-box" style="flex:1;">
										<text class="price-symbol">¥</text>
										<input class="price-input" v-model="fixPrice" type="digit" placeholder="定价"/>
									</view>
								</view>
								<view class="inline-field">
									<input class="form-input" v-model="printTime" placeholder="印刷时间" style="flex:1;"/>
								</view>
							</view>
						</view>

						<!-- 价格 & 库存 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">价格 & 库存</text>
							</view>
							<view class="inline-fields" style="flex:1;">
								<view class="inline-field">
									<view class="price-input-box" style="flex:1;">
										<text class="price-symbol">¥</text>
										<input class="price-input" v-model="price" type="digit" placeholder="价格"/>
									</view>
								</view>
								<view class="inline-field">
									<input class="form-input" v-model="stock" type="number" placeholder="库存" style="flex:1;"/>
								</view>
							</view>
						</view>

						<!-- 品相 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">品相</text>
							</view>
							<view class="condition-list">
								<view
									class="condition-item"
									v-for="(item, index) in conditionList"
									:key="index"
									:class="{ active: selectedCondition === item }"
									@click="selectCondition(item)"
								>
									<text class="condition-text">{{ item }}</text>
								</view>
							</view>
						</view>

						<!-- 拍照 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-text">拍照</text>
								<text class="photo-count">已拍{{ photoList.length }}/9张</text>
							</view>
							<view class="photo-section">
								<view class="photo-list">
									<view class="photo-item" v-for="(photo, index) in photoList" :key="index">
										<image class="photo-image" :src="photo" mode="aspectFill" @click="previewPhoto(photo, index)"></image>
										<view class="photo-index-badge">
											<text class="photo-index-badge-text">{{ index + 1 }}</text>
										</view>
										<view class="photo-delete" @click="deletePhoto(index)">
											<text class="delete-icon">✕</text>
										</view>
									</view>
									<view class="photo-add" @click="takePhoto" v-if="photoList.length < 9">
										<text class="add-icon">+</text>
										<text class="add-text">拍照</text>
									</view>
								</view>
							</view>
						</view>

						<!-- 市场竞争 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-text">市场竞争</text>
							</view>
							<view class="market-stats">
								<view class="stat-item">
									<text class="stat-label">在售</text>
									<text class="stat-value">{{ marketData.onSale }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">旧书</text>
									<text class="stat-value">{{ marketData.old }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">新书</text>
									<text class="stat-value">{{ marketData.new }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">已售</text>
									<text class="stat-value">{{ marketData.sold }}</text>
								</view>
							</view>
						</view>

						<!-- 在售商品 -->
						<view class="form-section">
							<view class="section-header-row">
								<view class="section-title">
									<text class="title-text">在售商品</text>
									<text class="product-count" v-if="productList.length > 0">({{ productList.length }}本)</text>
								</view>
								<view class="compare-toggle">
									<text class="toggle-btn" :class="{ active: compareType === 'isbn' }" @click="switchCompare('isbn')">ISBN比价</text>
									<text class="toggle-btn" :class="{ active: compareType === 'name' }" @click="switchCompare('name')">书名比价</text>
								</view>
								<view class="sort-toggle">
									<text class="sort-btn" :class="{ active: sortBy === 'total' }" @click="sortProducts('total')">总价</text>
									<text class="sort-btn" :class="{ active: sortBy === 'book' }" @click="sortProducts('book')">书价</text>
								</view>
								<text class="filter-btn" @click="showMoreFilter">筛选</text>
							</view>
							
							<!-- 加载状态 -->
							<view class="loading-box" v-if="isLoading">
								<view class="loading-spinner"></view>
								<text class="loading-text">正在比价...</text>
							</view>
							
							<!-- 商品列表 -->
							<view class="product-grid" v-else>
								<view class="grid-item" v-for="(item, index) in sortedProductList.slice(0, 12)" :key="index">
									<image class="grid-image" :src="item.image" mode="aspectFill" @click="previewProductImage(index)"></image>
									<text class="grid-total-price">¥{{ item.totalPrice }}</text>
									<text class="grid-price-detail">(书{{ item.bookPrice }}+运{{ item.shippingFee }})</text>
									<text class="grid-condition">{{ item.condition }}</text>
									<text class="grid-shop">{{ item.shopName }}</text>
								</view>
								
								<!-- 无数据提示 -->
								<view class="no-data" v-if="productList.length === 0">
									<text class="no-data-text">暂无在售商品，请先进行比价</text>
								</view>
							</view>
						</view>
						
						<!-- 上书记录 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-text">上书记录</text>
							</view>
							<view class="history-list">
								<view class="history-item" v-for="(item, index) in historyList" :key="index">
									<view class="history-row">
										<text class="history-date">{{ item.date }}</text>
										<text class="history-condition">{{ item.condition }}</text>
									</view>
									<view class="history-row">
										<text class="history-price">¥{{ item.price }}</text>
										<text class="history-stock">库存{{ item.stock }}本</text>
									</view>
								</view>
							</view>
						</view>

						<view class="bottom-placeholder"></view>
					</scroll-view>
				</view>
			</swiper-item>

			<!-- 无ISBN上传内容 -->
			<swiper-item>
				<view class="tab-content">
					<scroll-view class="content-scroll" scroll-y="true">
						<!-- 货区选择 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">货区选择</text>
							</view>
							<view class="picker-box" @click="openWarehousePicker('no-isbn')">
								<text class="picker-value">{{ noIsbnSelectedArea || '请选择货区' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</view>

						<!-- 印刷时间 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">印刷时间</text>
							</view>
							<input class="form-input" v-model="noIsbnPrintTime" placeholder="请输入印刷时间" />
						</view>

						<!-- 书名 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">书名</text>
							</view>
							<input class="form-input" v-model="noIsbnBookName" placeholder="请输入书名" />
						</view>

						<!-- 出版社 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">出版社</text>
							</view>
							<input class="form-input" v-model="noIsbnPublisher" placeholder="请输入出版社" />
						</view>

						<!-- 图书分类 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">图书分类</text>
							</view>
							<view class="category-select" @click="showCategoryPopup = true">
								<text class="category-value">{{ noIsbnSelectedCategory || '请选择分类' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</view>

						<!-- 开本 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">开本</text>
							</view>
							<input class="form-input" v-model="noIsbnFormat" placeholder="请输入开本" />
						</view>

						<!-- 定价 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">定价</text>
							</view>
							<view class="price-input-box">
								<text class="price-symbol">¥</text>
								<input class="price-input" v-model="noIsbnOriginalPrice" placeholder="请输入定价" type="digit" />
							</view>
						</view>

						<!-- 字数 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">字数</text>
							</view>
							<input class="form-input" v-model="noIsbnWordCount" placeholder="请输入字数" type="number" />
						</view>

						<!-- ISBN -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">ISBN</text>
							</view>
							<input class="form-input" v-model="noIsbnIsbn" placeholder="请输入ISBN" type="number" />
						</view>

						<!-- 品相 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">品相</text>
							</view>
							<view class="condition-list">
								<view 
									class="condition-item" 
									v-for="(item, index) in conditionList" 
									:key="index"
									:class="{ active: noIsbnSelectedCondition === item }"
									@click="noIsbnSelectedCondition = item"
								>
									<text class="condition-text">{{ item }}</text>
								</view>
							</view>
						</view>

						<!-- 价格 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">价格</text>
							</view>
							<view class="price-input-box">
								<text class="price-symbol">¥</text>
								<input class="price-input" v-model="noIsbnPrice" placeholder="请输入价格" type="digit" />
							</view>
						</view>

						<!-- 库存 -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">库存</text>
							</view>
							<input class="form-input" v-model="noIsbnStock" placeholder="请输入库存数量" type="number" />
						</view>

						<!-- 拍照 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-text">拍照</text>
								<text class="photo-count">已拍{{ noIsbnPhotoList.length }}/9张</text>
							</view>
							<view class="photo-section">
								<view class="photo-list">
									<view class="photo-item" v-for="(photo, index) in noIsbnPhotoList" :key="index">
										<image class="photo-image" :src="photo" mode="aspectFill" @click="previewPhoto(photo, index)"></image>
										<view class="photo-index-badge">
											<text class="photo-index-badge-text">{{ index + 1 }}</text>
										</view>
										<view class="photo-delete" @click="deleteNoIsbnPhoto(index)">
											<text class="delete-icon">✕</text>
										</view>
									</view>
									<view class="photo-add" @click="takePhotoNoIsbn" v-if="noIsbnPhotoList.length < 9">
										<text class="add-icon">+</text>
										<text class="add-text">拍照</text>
									</view>
								</view>
							</view>
						</view>

						<view class="bottom-placeholder"></view>
					</scroll-view>
				</view>
			</swiper-item>

			<!-- 设置内容 -->
			<swiper-item>
				<view class="tab-content">
					<view class="settings-swiper">
						<swiper :current="settingsSubTabIndex" @change="onSettingsSwiperChange" style="height:100%;">
							<swiper-item>
								<scroll-view class="content-scroll" scroll-y="true">
									<view class="form-section">
										<view class="section-title">
											<text class="title-text">账号管理</text>
										</view>
										<view class="logged-in-card" v-if="isLoggedIn">
											<view class="card-header">
												<view class="card-avatar"></view>
												<view class="card-user-info">
													<text class="card-shop-name">{{ shopName }}</text>
													<view class="card-region-row">
														<text class="card-region-icon">📍</text>
														<text class="card-region">{{ shopRegion }}</text>
													</view>
												</view>
											</view>
											<view class="card-footer">
												<text class="logout-btn-text" @click="handleLogout">退出登录</text>
											</view>
										</view>
										<view v-else>
											<view class="login-header">
												<text class="login-title">孔网账号登录</text>
											</view>
											<view class="login-form">
												<view class="input-row">
													<input class="form-input" v-model="loginAccount" placeholder="账号（手机号/用户名）" />
												</view>
												<view class="password-wrapper input-row">
													<input 
														class="form-input password-input" 
														v-model="loginPassword" 
														:type="showPassword ? 'text' : 'password'" 
														placeholder="密码"
													/>
													<view class="password-eye" @click="showPassword = !showPassword">
														<view class="eye-css">
															<view class="eye-open" :class="{ 'eye-active': showPassword }" v-if="showPassword">
																<view class="eye-open-inner">
																	<view class="pupil"></view>
																</view>
															</view>
															<view class="eye-close" v-else>
																<view class="eye-close-line"></view>
															</view>
														</view>
													</view>
												</view>
												<view class="checkbox-row">
													<switch :checked="rememberPassword" @change="rememberPassword = $event.detail.value" color="#409eff" style="transform:scale(0.7)" />
													<text class="checkbox-label">记住密码</text>
												</view>
												<view class="login-btn" @click="handleLogin">登录</view>
											</view>
										</view>
									</view>
								</scroll-view>
							</swiper-item>
							<swiper-item>
								<scroll-view class="content-scroll" scroll-y="true">
									<view class="form-section">
										<view class="section-title">
											<text class="title-text">屏蔽设置</text>
										</view>
										<text class="section-desc">填写后屏蔽指定ISBN或名称的商品</text>
										<textarea class="blocked-textarea" v-model="blockedList" placeholder="每行一个，支持ISBN或书名关键词" />
									</view>
								</scroll-view>
							</swiper-item>
							<swiper-item>
								<scroll-view class="content-scroll" scroll-y="true">
									<view class="form-section">
										<view class="section-title">
											<text class="title-text">其他设置</text>
										</view>
										<text class="section-desc">更多设置即将上线</text>
									</view>
								</scroll-view>
							</swiper-item>
						</swiper>
						<view class="settings-sub-tabs">
							<view class="settings-sub-tab" :class="{ active: settingsSubTabIndex === 0 }" @click="settingsSubTabIndex = 0">
								<text>账号</text>
							</view>
							<view class="settings-sub-tab" :class="{ active: settingsSubTabIndex === 1 }" @click="settingsSubTabIndex = 1">
								<text>屏蔽</text>
							</view>
							<view class="settings-sub-tab" :class="{ active: settingsSubTabIndex === 2 }" @click="settingsSubTabIndex = 2">
								<text>其他</text>
							</view>
						</view>
					</view>
				</view>
			</swiper-item>
		</swiper>

		<!-- 底部提交栏 -->
		<view class="bottom-bar">
			<view class="submit-btn" @click="submitUpload">
				<text class="submit-text">确认上传</text>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<view class="filter-popup" v-if="showFilterPopup" @click="showFilterPopup = false">
			<view class="popup-content" @click.stop>
				<view class="popup-header">
					<text class="popup-title">筛选条件</text>
					<text class="popup-close" @click="showFilterPopup = false">✕</text>
				</view>
				<view class="popup-body">
					<view class="filter-group">
						<text class="group-title">品相</text>
						<view class="tag-list">
							<view 
								class="tag-item" 
								v-for="(item, index) in conditionList" 
								:key="index"
								:class="{ active: filterCondition === item }"
								@click="filterCondition = item"
							>
								<text class="tag-text">{{ item }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="popup-footer">
					<view class="reset-btn" @click="resetFilter">重置</view>
					<view class="confirm-btn" @click="applyFilter">确定</view>
				</view>
			</view>
		</view>

		<!-- 分类选择弹窗 -->
		<view class="filter-popup" v-if="showCategoryPopup" @click="showCategoryPopup = false">
			<view class="popup-content category-picker-popup" @click.stop>
				<view class="popup-header">
					<text class="popup-title">选择分类</text>
					<text class="popup-close" @click="showCategoryPopup = false">✕</text>
				</view>
				<view class="category-picker-body">
					<picker-view class="category-picker-view" :value="categoryPickerValue" @change="onCategoryChange">
						<picker-view-column>
							<view class="picker-item" v-for="(item, index) in categoryList" :key="index">{{ item }}</view>
						</picker-view-column>
					</picker-view>
				</view>
				<view class="popup-footer">
					<view class="confirm-btn" @click="confirmCategory">确定</view>
				</view>
			</view>
		</view>

		<!-- 仓库货位选择弹窗 -->
		<view class="warehouse-overlay" v-if="showWarehousePicker" @click="closeWarehousePicker">
			<view class="warehouse-popup" @click.stop>
				<view class="popup-header">
					<text class="popup-title">选择仓库货位</text>
					<text class="popup-close" @click="closeWarehousePicker">✕</text>
				</view>
				<view class="popup-body wh-tabs-body">
					<scroll-view class="wh-tabs-bar" scroll-x :show-scrollbar="false">
						<view 
							class="wh-tab" 
							v-for="(w, idx) in popupWarehouseList" 
							:key="w.id"
							:class="{ active: popupActiveWhIndex === idx }"
							@click="selectPopupWarehouse(idx)"
						>
							<text class="wh-tab-text">{{ w.name }}</text>
						</view>
					</scroll-view>
					<scroll-view class="wh-location-list" scroll-y @scrolltolower="loadMorePopupLocation">
						<view 
							class="wh-loc-item" 
							v-for="loc in popupLocationList" 
							:key="loc.id"
							:class="{ active: popupSelectedLoc && popupSelectedLoc.id === loc.id }"
							@click="selectPopupLocation(loc)"
						>
							<text class="wh-loc-code">{{ loc.code }} - {{ loc.name }}</text>
							<text class="wh-loc-check" v-if="popupSelectedLoc && popupSelectedLoc.id === loc.id">✓</text>
						</view>
						<view class="popup-loading" v-if="popupLocLoadingMore">
							<view class="mini-spinner"></view>
							<text>加载中...</text>
						</view>
						<view class="popup-hint-end" v-if="!popupLocHasMore && popupLocationList.length > 0">
							<text>— 已全部加载 —</text>
						</view>
						<view class="popup-hint" v-if="popupLocationList.length === 0 && !popupLoadingLocation">
							<text>暂无货位</text>
						</view>
						<view class="popup-hint" v-if="popupLoadingLocation">
							<view class="loading-spinner" style="width:40rpx;height:40rpx;"></view>
							<text>加载中...</text>
						</view>
					</scroll-view>
				</view>
				<view class="popup-footer">
					<view class="popup-footer-btn cancel" @click="closeWarehousePicker">取消</view>
					<view class="popup-footer-btn confirm" :class="{ disabled: !popupSelectedLoc }" @click="confirmWarehousePicker">确定</view>
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
			currentTab: 'isbn',
			swiperIndex: 0,
			settingsSubTabIndex: 0,
			
			// ISBN表单
			isbn: '',
			bookName: '',
			author: '',
			publisher: '',
			fixPrice: '',
			printTime: '',
			price: '',
			stock: '',
			selectedCondition: '',
			conditionList: ['六品', '七品', '八品', '八五品', '九品', '九五品', '全新'],
			photoList: [],
			isbnSelectedArea: '',
			isbnWarehouseData: null,
			marketData: { onSale: 0, old: 0, new: 0, sold: 0 },
			productList: [],
			compareType: 'isbn',
			sortBy: 'total',
			historyList: [],
			isSubmitting: false,
			isLoading: false,
			
			// 无ISBN表单
			noIsbnPrintTime: '',
			noIsbnBookName: '',
			noIsbnPublisher: '',
			noIsbnSelectedCategory: '',
			noIsbnFormat: '',
			noIsbnOriginalPrice: '',
			noIsbnWordCount: '',
			noIsbnIsbn: '',
			noIsbnSelectedCondition: '',
			noIsbnPrice: '',
			noIsbnStock: '',
			noIsbnPhotoList: [],
			noIsbnSelectedArea: '',
			noIsbnWarehouseData: null,
			
			// 分类
			showCategoryPopup: false,
			categoryList: ['文学', '艺术', '历史', '哲学', '科学', '技术', '教育', '经济', '政治', '军事', '法律', '社会', '文化', '语言', '工具书', '其他'],
			categoryPickerValue: [0],
			
			// 筛选
			showFilterPopup: false,
			filterCondition: '',
			
			// 仓库弹窗
			showWarehousePicker: false,
			pickerTargetTab: 'isbn',
			popupWarehouseList: [],
			popupActiveWhIndex: 0,
			popupLocationList: [],
			popupSelectedWh: null,
			popupSelectedLoc: null,
			popupLoading: false,
			popupLoadingLocation: false,
			popupLocPage: 1,
			popupLocPageSize: 20,
			popupLocHasMore: true,
			popupLocLoadingMore: false,
			
			// 登录
			isLoggedIn: false,
			shopName: '',
			shopRegion: '',
			loginAccount: '',
			loginPassword: '',
			showPassword: false,
			rememberPassword: false,
			blockedList: ''
		}
	},

	onLoad(options) {
		uni.setNavigationBarTitle({ title: '图书上传' })
		if (options && options.tab) {
			this.currentTab = options.tab
			this.swiperIndex = options.tab === 'no-isbn' ? 1 : 0
		}
	},

	computed: {
		sortedProductList() {
			const list = [...this.productList]
			if (this.sortBy === 'total') {
				list.sort((a, b) => parseFloat(a.totalPrice || 0) - parseFloat(b.totalPrice || 0))
			} else if (this.sortBy === 'book') {
				list.sort((a, b) => parseFloat(a.bookPrice || 0) - parseFloat(b.bookPrice || 0))
			}
			return list
		}
	},

	methods: {
		// 标签切换
		switchTab(tab) {
			const idx = tab === 'isbn' ? 0 : tab === 'no-isbn' ? 1 : 2
			this.swiperIndex = idx
			this.currentTab = tab
			if (tab === 'settings') {
				this.settingsSubTabIndex = 0
			}
		},

		onTabSwiperChange(e) {
			const idx = e.detail.current
			this.swiperIndex = idx
			const tabs = ['isbn', 'no-isbn', 'settings']
			this.currentTab = tabs[idx]
		},

		onSettingsSwiperChange(e) {
			this.settingsSubTabIndex = e.detail.current
		},

		// ISBN扫码
		scanISBN() {
			uni.scanCode({
				onlyFromCamera: false,
				success: (res) => {
					this.isbn = (res.result || '').trim()
					this.searchISBN()
				},
				fail: () => {
					uni.showToast({ title: '扫码取消或失败', icon: 'none' })
				}
			})
		},

		// ISBN搜索
		searchISBN() {
			if (!this.isbn) {
				uni.showToast({ title: '请输入ISBN', icon: 'none' })
				return
			}
			this.isLoading = true
			setTimeout(() => {
				this.isLoading = false
				uni.showToast({ title: '搜索完成', icon: 'success' })
			}, 1000)
		},

		// 品相选择
		selectCondition(item) {
			this.selectedCondition = item
		},

		// 拍照
		takePhoto() {
			if (this.photoList.length >= 9) return
			uni.chooseImage({
				count: 9 - this.photoList.length,
				success: (res) => {
					this.photoList = [...this.photoList, ...res.tempFilePaths]
				}
			})
		},

		deletePhoto(index) {
			this.photoList.splice(index, 1)
		},

		previewPhoto(photo, index) {
			uni.previewImage({
				urls: this.photoList,
				current: index
			})
		},

		// 无ISBN拍照
		takePhotoNoIsbn() {
			if (this.noIsbnPhotoList.length >= 9) return
			uni.chooseImage({
				count: 9 - this.noIsbnPhotoList.length,
				success: (res) => {
					this.noIsbnPhotoList = [...this.noIsbnPhotoList, ...res.tempFilePaths]
				}
			})
		},

		deleteNoIsbnPhoto(index) {
			this.noIsbnPhotoList.splice(index, 1)
		},

		// 仓库弹窗
		openWarehousePicker(tab) {
			this.pickerTargetTab = tab
			this.showWarehousePicker = true
			this.loadPopupWarehouses()
		},

		closeWarehousePicker() {
			this.showWarehousePicker = false
			this.popupSelectedLoc = null
		},

		async loadPopupWarehouses() {
			this.popupLoading = true
			try {
				const res = await getWarehouseList({ status: 1, page: 1, page_size: 100 })
				if (res.code === 0 && res.data && res.data.list) {
					this.popupWarehouseList = res.data.list
					if (this.popupWarehouseList.length > 0) {
						this.popupActiveWhIndex = 0
						this.loadPopupLocations(this.popupWarehouseList[0].id)
					}
				}
			} catch (e) {
				console.error('加载仓库失败:', e)
			} finally {
				this.popupLoading = false
			}
		},

		async loadPopupLocations(warehouseId) {
			this.popupLoadingLocation = true
			this.popupLocPage = 1
			this.popupLocHasMore = true
			try {
				const res = await getLocationList({
					warehouse_id: warehouseId, type: 1, status: 1,
					page: 1, page_size: this.popupLocPageSize
				})
				if (res.code === 0 && res.data && res.data.list) {
					this.popupLocationList = res.data.list
					const total = res.data.total || 0
					this.popupLocHasMore = this.popupLocPage * this.popupLocPageSize < total
				} else {
					this.popupLocationList = []
					this.popupLocHasMore = false
				}
			} catch (e) {
				this.popupLocationList = []
				this.popupLocHasMore = false
			} finally {
				this.popupLoadingLocation = false
			}
		},

		selectPopupWarehouse(idx) {
			this.popupActiveWhIndex = idx
			const wh = this.popupWarehouseList[idx]
			if (wh) {
				this.popupSelectedWh = wh
				this.popupSelectedLoc = null
				this.loadPopupLocations(wh.id)
			}
		},

		selectPopupLocation(loc) {
			this.popupSelectedLoc = loc
		},

		confirmWarehousePicker() {
			if (!this.popupSelectedLoc) return
			const wh = this.popupWarehouseList[this.popupActiveWhIndex]
			if (this.pickerTargetTab === 'isbn') {
				this.isbnWarehouseData = {
					warehouseId: wh.id,
					warehouseName: wh.name,
					warehouseCode: wh.code,
					locationId: this.popupSelectedLoc.id,
					locationCode: this.popupSelectedLoc.code,
					locationName: this.popupSelectedLoc.name
				}
				this.isbnSelectedArea = `${wh.name} - ${this.popupSelectedLoc.code}`
			} else {
				this.noIsbnWarehouseData = {
					warehouseId: wh.id,
					warehouseName: wh.name,
					warehouseCode: wh.code,
					locationId: this.popupSelectedLoc.id,
					locationCode: this.popupSelectedLoc.code,
					locationName: this.popupSelectedLoc.name
				}
				this.noIsbnSelectedArea = `${wh.name} - ${this.popupSelectedLoc.code}`
			}
			this.showWarehousePicker = false
		},

		loadMorePopupLocation() {
			if (!this.popupLocHasMore || this.popupLocLoadingMore) return
			this.popupLocLoadingMore = true
			this.popupLocPage++
			const wh = this.popupWarehouseList[this.popupActiveWhIndex]
			if (!wh) return
			getLocationList({
				warehouse_id: wh.id, type: 1, status: 1,
				page: this.popupLocPage, page_size: this.popupLocPageSize
			}).then(res => {
				if (res.code === 0 && res.data && res.data.list) {
					const newList = res.data.list
					if (newList.length === 0) {
						this.popupLocHasMore = false
					} else {
						this.popupLocationList = [...this.popupLocationList, ...newList]
						const total = res.data.total || 0
						this.popupLocHasMore = this.popupLocPage * this.popupLocPageSize < total
					}
				} else {
					this.popupLocHasMore = false
				}
			}).catch(() => {
				this.popupLocPage--
			}).finally(() => {
				this.popupLocLoadingMore = false
			})
		},

		// 比价切换
		switchCompare(type) {
			this.compareType = type
		},

		// 排序
		sortProducts(by) {
			this.sortBy = by
		},

		// 筛选
		showMoreFilter() {
			this.showFilterPopup = true
		},

		resetFilter() {
			this.filterCondition = ''
		},

		applyFilter() {
			this.showFilterPopup = false
		},

		// 分类
		onCategoryChange(e) {
			this.categoryPickerValue = e.detail.value
		},

		confirmCategory() {
			this.noIsbnSelectedCategory = this.categoryList[this.categoryPickerValue[0]]
			this.showCategoryPopup = false
		},

		// 商品预览
		previewProductImage(index) {
			const urls = this.productList.map(item => item.image).filter(Boolean)
			if (urls.length > 0) {
				uni.previewImage({ urls, current: index })
			}
		},

		// 提交上传
		submitUpload() {
			if (this.isSubmitting) return
			this.isSubmitting = true

			const warehouseData = this.currentTab === 'isbn' ? this.isbnWarehouseData : this.noIsbnWarehouseData
			if (!warehouseData) {
				uni.showToast({ title: '请选择货区', icon: 'none' })
				this.isSubmitting = false
				return
			}

			uni.showLoading({ title: '上传中...' })
			setTimeout(() => {
				uni.hideLoading()
				this.isSubmitting = false
				uni.showToast({ title: '上传成功', icon: 'success' })
			}, 1500)
		},

		// 登录
		handleLogin() {
			uni.showLoading({ title: '登录中...' })
			setTimeout(() => {
				uni.hideLoading()
				this.isLoggedIn = true
				this.shopName = '测试店铺'
				this.shopRegion = '北京'
				uni.showToast({ title: '登录成功', icon: 'success' })
			}, 1000)
		},

		handleLogout() {
			uni.showModal({
				title: '提示',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						this.isLoggedIn = false
						this.shopName = ''
						this.shopRegion = ''
					}
				}
			})
		}
	}
}
</script>

<style>
.page-container {
  background-color: #f5f6fa;
  min-height: 100vh;
}

/* ========== Tab 头部 ========== */
.tab-header {
  display: flex;
  background-color: #ffffff;
  border-bottom: 2rpx solid #e4e7ed;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 26rpx 0;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background-color: #409eff;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 28rpx;
  color: #606266;
}

.tab-item.active .tab-text {
  color: #409eff;
  font-weight: 600;
}

/* ========== Swiper ========== */
.tab-swiper {
  height: calc(100vh - 180rpx);
}

.settings-swiper {
  height: calc(100vh - 280rpx);
}

.content-scroll {
  height: calc(100vh - 200rpx);
}

.tab-content {
  padding: 16rpx;
}

/* ========== 表单区块 ========== */
.form-section {
  background-color: #ffffff;
  border-radius: 12rpx;
  border: 2rpx solid #ebeef5;
  margin-bottom: 16rpx;
  padding: 24rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}

.title-text {
  font-size: 28rpx;
  color: #303133;
  font-weight: 600;
}

.photo-count {
  font-size: 22rpx;
  color: #909399;
  margin-left: auto;
}

.field-label {
  display: block;
  margin-bottom: 10rpx;
}

.label-text {
  font-size: 26rpx;
  color: #606266;
  font-weight: 500;
}

/* ========== 输入框 ========== */
.form-input {
  background-color: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  height: 76rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #409eff;
}

/* ========== 选择器 ========== */
.picker-box {
  background-color: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  height: 76rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-value {
  font-size: 28rpx;
  color: #606266;
  flex: 1;
}

.picker-arrow {
  font-size: 36rpx;
  color: #c0c4cc;
}

/* ========== ISBN 输入 ========== */
.isbn-input-box {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

.isbn-input {
  flex: 1;
  background-color: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  height: 76rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

/* ========== 行内字段 ========== */
.inline-fields {
  display: flex;
  gap: 16rpx;
}

.inline-field {
  flex: 1;
}

.inline-field.narrow {
  flex: none;
  width: 200rpx;
}

/* ========== 价格输入 ========== */
.price-input-box {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  height: 76rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.price-input-box:focus-within {
  border-color: #409eff;
}

.price-symbol {
  color: #f56c6c;
  font-size: 28rpx;
  font-weight: 500;
  margin-right: 6rpx;
}

.price-input {
  flex: 1;
  border: none;
  outline: none;
  height: 100%;
  font-size: 28rpx;
  background: transparent;
}

/* ========== 扫描/搜索按钮 ========== */
.scan-btn {
  background-color: #67c23a;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 6rpx rgba(103,194,58,0.3);
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-icon {
  font-size: 32rpx;
}

.search-btn {
  background-color: #409eff;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 6rpx rgba(64,158,255,0.3);
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
}

/* ========== 品相选择 ========== */
.condition-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.condition-item {
  background-color: #f4f4f5;
  border: 2rpx solid #e9e9eb;
  border-radius: 8rpx;
  padding: 12rpx 20rpx;
}

.condition-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.condition-text {
  font-size: 26rpx;
  color: #606266;
}

.condition-item.active .condition-text {
  color: #409eff;
}

/* ========== 拍照 ========== */
.photo-section {
  width: 100%;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.photo-item {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
  border: 2rpx solid #ebeef5;
  position: relative;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-index-badge {
  position: absolute;
  bottom: 6rpx;
  left: 6rpx;
  background-color: rgba(0,0,0,0.55);
  border-radius: 50%;
  width: 30rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-index-badge-text {
  color: #ffffff;
  font-size: 20rpx;
}

.photo-delete {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 38rpx;
  height: 38rpx;
  background-color: #f56c6c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 6rpx rgba(245,108,108,0.3);
}

.delete-icon {
  color: #ffffff;
  font-size: 22rpx;
}

.photo-add {
  width: 140rpx;
  height: 140rpx;
  border: 2rpx dashed #dcdfe6;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.add-icon {
  font-size: 40rpx;
  color: #909399;
}

.add-text {
  font-size: 22rpx;
  color: #909399;
  margin-top: 4rpx;
}

/* ========== 市场竞争统计 ========== */
.market-stats {
  background-color: #fafafa;
  border: 2rpx solid #ebeef5;
  border-radius: 8rpx;
  padding: 18rpx 8rpx;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #909399;
}

.stat-value {
  font-size: 32rpx;
  color: #303133;
  font-weight: 600;
}

/* ========== 在售商品 ========== */
.section-header-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 14rpx;
}

.product-count {
  font-size: 24rpx;
  color: #909399;
  margin-left: 6rpx;
}

.compare-toggle {
  display: flex;
  gap: 6rpx;
}

.toggle-btn {
  font-size: 22rpx;
  color: #909399;
  background-color: #f4f4f5;
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
}

.toggle-btn.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.sort-toggle {
  display: flex;
  gap: 6rpx;
}

.sort-btn {
  font-size: 22rpx;
  color: #909399;
  background-color: #f4f4f5;
  padding: 6rpx 14rpx;
  border-radius: 6rpx;
}

.sort-btn.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.filter-btn {
  font-size: 24rpx;
  color: #409eff;
  margin-left: auto;
}

/* ========== 加载状态 ========== */
.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  gap: 16rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e4e7ed;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: #909399;
}

/* ========== 商品网格 ========== */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
  margin-top: 14rpx;
}

.grid-item {
  background-color: #fafafa;
  border: 2rpx solid #ebeef5;
  border-radius: 8rpx;
  padding: 10rpx;
}

.grid-image {
  width: 100%;
  height: 150rpx;
  border-radius: 6rpx;
}

.grid-total-price {
  font-size: 28rpx;
  color: #f56c6c;
  font-weight: 600;
  display: block;
  margin-top: 6rpx;
}

.grid-price-detail {
  font-size: 20rpx;
  color: #909399;
  display: block;
}

.grid-condition {
  font-size: 22rpx;
  color: #606266;
  display: block;
  margin-top: 4rpx;
}

.grid-shop {
  font-size: 20rpx;
  color: #909399;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-data {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40rpx 0;
}

.no-data-text {
  font-size: 26rpx;
  color: #909399;
}

/* ========== 上书记录 ========== */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.history-item {
  background-color: #fafafa;
  border: 2rpx solid #f0f1f3;
  border-radius: 8rpx;
  padding: 14rpx 16rpx;
}

.history-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-date {
  font-size: 24rpx;
  color: #909399;
}

.history-condition {
  font-size: 24rpx;
  color: #606266;
}

.history-price {
  font-size: 28rpx;
  color: #f56c6c;
  font-weight: 600;
}

.history-stock {
  font-size: 24rpx;
  color: #909399;
}

.bottom-placeholder {
  height: 40rpx;
}

/* ========== 底部提交栏 ========== */
.bottom-bar {
  background-color: #ffffff;
  border-top: 2rpx solid #e4e7ed;
  padding: 16rpx 24rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.submit-btn {
  background-color: #409eff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(64,158,255,0.2);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
}

/* ========== 筛选弹窗 ========== */
.filter-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.popup-content {
  background-color: #ffffff;
  border-radius: 14rpx 14rpx 0 0;
  padding: 28rpx;
  width: 100%;
  box-sizing: border-box;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.popup-title {
  font-size: 30rpx;
  color: #303133;
  font-weight: 600;
}

.popup-close {
  font-size: 32rpx;
  color: #909399;
  padding: 8rpx;
}

.popup-body {
  max-height: 60vh;
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 20rpx;
}

.group-title {
  font-size: 26rpx;
  color: #606266;
  font-weight: 500;
  display: block;
  margin-bottom: 10rpx;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag-item {
  background-color: #f4f4f5;
  border: 2rpx solid #e9e9eb;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
}

.tag-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.tag-text {
  font-size: 26rpx;
  color: #606266;
}

.tag-item.active .tag-text {
  color: #409eff;
}

.popup-footer {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.reset-btn {
  flex: 1;
  height: 76rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #606266;
}

.confirm-btn {
  flex: 1;
  height: 76rpx;
  background-color: #409eff;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #ffffff;
}

/* ========== 分类选择弹窗 ========== */
.category-picker-popup {
  height: 50vh;
}

.category-picker-body {
  height: calc(50vh - 120rpx);
}

.category-picker-view {
  width: 100%;
  height: 100%;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #303133;
  height: 80rpx;
}

/* ========== 分类选择（input风格） ========== */
.category-select {
  background-color: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  height: 76rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-value {
  font-size: 28rpx;
  color: #606266;
  flex: 1;
}

/* ========== 仓库弹窗 ========== */
.warehouse-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3);
  backdrop-filter: blur(4rpx);
  z-index: 1001;
  display: flex;
  align-items: flex-end;
}

.warehouse-popup {
  background-color: #f0f2f5;
  height: 68vh;
  border-radius: 14rpx 14rpx 0 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* ========== 仓库 Tabs ========== */
.wh-tabs-bar {
  height: 80rpx;
  background-color: #ffffff;
  border-radius: 8rpx 8rpx 0 0;
  white-space: nowrap;
  display: flex;
}

.wh-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  height: 80rpx;
  position: relative;
  flex-shrink: 0;
}

.wh-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #409eff;
  border-radius: 2rpx;
}

.wh-tab-text {
  font-size: 26rpx;
  color: #606266;
}

.wh-tab.active .wh-tab-text {
  color: #409eff;
  font-weight: 600;
}

/* ========== 仓库货位列表 ========== */
.wh-location-list {
  flex: 1;
  overflow-y: auto;
  padding: 10rpx 16rpx;
}

.wh-loc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 16rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}

.wh-loc-item.active {
  background-color: #ecf5ff;
  border: 2rpx solid #409eff;
}

.wh-loc-code {
  font-size: 26rpx;
  color: #303133;
}

.wh-loc-check {
  font-size: 28rpx;
  color: #409eff;
  font-weight: 600;
}

/* ========== Popup 提示 ========== */
.popup-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #909399;
}

.popup-hint-end {
  text-align: center;
  padding: 20rpx 0;
  font-size: 24rpx;
  color: #c0c4cc;
}

.popup-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #909399;
}

.mini-spinner {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #e4e7ed;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ========== Popup Footer Btn ========== */
.popup-footer-btn {
  flex: 1;
  height: 76rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.popup-footer-btn.cancel {
  background-color: #ffffff;
  border: 2rpx solid #dcdfe6;
  color: #606266;
}

.popup-footer-btn.confirm {
  background-color: #409eff;
  color: #ffffff;
}

.popup-footer-btn.confirm.disabled {
  background-color: #a0cfff;
  color: #ffffff;
  opacity: 0.6;
}

/* ========== 设置子Tabs ========== */
.settings-sub-tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 2rpx solid #e4e7ed;
}

.settings-sub-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #606266;
  position: relative;
}

.settings-sub-tab.active {
  color: #409eff;
  font-weight: 600;
}

.settings-sub-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background-color: #409eff;
  border-radius: 2rpx;
}

/* ========== 设置 - 已登录卡片 ========== */
.logged-in-card {
  background-color: #fafafa;
  border: 2rpx solid #ebeef5;
  border-radius: 12rpx;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  gap: 14rpx;
}

.card-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: #409eff;
  flex-shrink: 0;
}

.card-user-info {
  flex: 1;
}

.card-shop-name {
  font-size: 28rpx;
  color: #303133;
  font-weight: 600;
  display: block;
}

.card-region-row {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-top: 6rpx;
}

.card-region-icon {
  font-size: 24rpx;
}

.card-region {
  font-size: 24rpx;
  color: #909399;
}

.card-footer {
  border-top: 2rpx solid #ebeef5;
  padding: 16rpx 20rpx;
  display: flex;
  justify-content: flex-end;
}

.logout-btn-text {
  font-size: 26rpx;
  color: #f56c6c;
}

/* ========== 登录样式 ========== */
.login-header {
  text-align: center;
  padding: 20rpx 0;
}

.login-title {
  font-size: 32rpx;
  color: #303133;
  font-weight: 600;
}

.login-form {
  padding-top: 10rpx;
}

.input-row {
  margin-bottom: 16rpx;
}

/* ========== 密码框 ========== */
.password-wrapper {
  position: relative;
}

.password-input {
  padding-right: 80rpx !important;
}

.password-eye {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 眼睛图标 CSS 实现 ========== */
.eye-css {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.eye-open {
  width: 36rpx;
  height: 36rpx;
  border: 3rpx solid #909399;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.eye-open.eye-active {
  border-color: #409eff;
}

.eye-open-inner {
  width: 14rpx;
  height: 14rpx;
  border: 2rpx solid #909399;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-open.eye-active .eye-open-inner {
  border-color: #409eff;
}

.pupil {
  width: 6rpx;
  height: 6rpx;
  background-color: #909399;
  border-radius: 50%;
}

.eye-open.eye-active .pupil {
  background-color: #409eff;
}

.eye-close {
  width: 36rpx;
  height: 10rpx;
  border-top: 3rpx solid #909399;
  border-bottom: 3rpx solid #909399;
  position: relative;
  transform: rotate(0deg);
}

.eye-close-line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40rpx;
  height: 3rpx;
  background-color: #909399;
  transform: translate(-50%, -50%) rotate(45deg);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 20rpx;
}

.checkbox-label {
  font-size: 24rpx;
  color: #909399;
}

.login-btn {
  background-color: #409eff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 12rpx rgba(64,158,255,0.2);
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 600;
}

/* ========== 屏蔽设置 ========== */
.section-desc {
  font-size: 24rpx;
  color: #909399;
  display: block;
  margin-bottom: 14rpx;
}

.blocked-textarea {
  width: 100%;
  min-height: 200rpx;
  background-color: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  padding: 16rpx;
  font-size: 26rpx;
  color: #303133;
  box-sizing: border-box;
}

.blocked-textarea:focus {
  border-color: #409eff;
}
</style>
