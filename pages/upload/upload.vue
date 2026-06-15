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

		<view class="tab-swiper">
			<!-- ISBN上传内容 -->
			<view class="tab-panel" v-show="swiperIndex === 0">
				<view class="tab-content">
					<scroll-view class="content-scroll" scroll-y="true">
						<!-- 基本信息块（品相 + 货区&ISBN + 书名 + 价格&库存） -->
						<view class="info-block">
							<!-- 品相（标签在前） -->
							<view class="info-inline-row">
								<text class="info-inline-label">品相</text>
								<view class="condition-list" style="flex:1;">
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

							<view class="info-block-divider"></view>

							<!-- 货区 & ISBN -->
							<view class="info-block-row">
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
									<view class="inline-field isbn-field">
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

							<view class="info-block-divider"></view>

							<!-- 书名（标签在前） -->
							<view class="info-inline-row">
								<text class="info-inline-label">书名</text>
								<input class="form-input info-inline-input" v-model="bookName" placeholder="请输入书名"/>
							</view>

							<view class="info-block-divider"></view>

							<!-- 价格 & 库存（标签在前） -->
							<view class="info-inline-row">
								<text class="info-inline-label">价格 & 库存</text>
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

						<!-- 市场竞争 & 在售商品（合并块） -->
						<view class="form-section">
							<!-- 市场统计 -->
							<view class="market-stats">
								<view class="stat-item">
									<text class="stat-label">在售</text>
									<text class="stat-value">{{ marketData.onSale }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">旧</text>
									<text class="stat-value">{{ marketData.old }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">新</text>
									<text class="stat-value">{{ marketData.new }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">已售</text>
									<text class="stat-value">{{ marketData.sold }}</text>
								</view>
							</view>

							<view class="info-block-divider" style="margin:14rpx 0;"></view>

							<!-- 在售商品 -->
							<view class="section-header-row">
								<view class="section-title" style="margin-bottom:0;">
									<text class="title-text">在售商品</text>
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
									<image class="grid-image" :src="item.image" mode="aspectFill" @click="previewProductImage(index)" v-if="item.image"></image>
									<text class="grid-book-name">{{ item.bookName || '未知书名' }}</text>
									<text class="grid-author">{{ item.author || '' }}</text>
									<text class="grid-total-price">¥{{ item.totalPrice.toFixed(2) }}</text>
									<text class="grid-price-detail">书¥{{ item.bookPrice.toFixed(2) }}+运¥{{ item.shippingFee.toFixed(2) }}</text>
									<text class="grid-condition">{{ item.condition || '' }}</text>
									<text class="grid-shop">{{ item.shopName || '' }}</text>
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
			</view>		<!-- /tab-panel ISBN -->

			<!-- 无ISBN上传内容 -->
			<view class="tab-panel" v-show="swiperIndex === 1">
				<view class="tab-content">
					<scroll-view class="content-scroll" scroll-y="true">

						<!-- ===== 基本信息块（品相 + 货区 + 书名 + 价格&库存） ===== -->
						<view class="info-block">
							<!-- 品相（标签在前） -->
							<view class="info-inline-row">
								<text class="info-inline-label">品相</text>
								<view class="condition-list" style="flex:1;">
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

							<view class="info-block-divider"></view>

							<!-- 货区 -->
							<view class="info-block-row">
								<view class="field-label">
									<text class="label-text">货区</text>
								</view>
								<view class="picker-box" @click="openWarehousePicker('no-isbn')">
									<text class="picker-value">{{ noIsbnSelectedArea || '请选择货区' }}</text>
									<text class="picker-arrow">›</text>
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 书名（标签在前） -->
							<view class="info-inline-row">
								<text class="info-inline-label">书名</text>
								<view class="inline-fields" style="flex:1;">
									<view class="inline-field" style="flex:1;">
										<input class="form-input" v-model="noIsbnBookName" placeholder="请输入书名" style="flex:1;" />
									</view>
									<view class="inline-field" style="flex:none;">
										<view class="search-btn" @click="searchNoIsbn">
											<text class="search-text">搜</text>
										</view>
									</view>
									<view class="inline-field" style="flex:none;margin-left:10rpx;">
										<view class="scan-btn" @click="chooseImageNoIsbn">
											<text class="scan-icon">📷</text>
										</view>
									</view>
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 价格 & 库存（标签在前） -->
							<view class="info-inline-row">
								<text class="info-inline-label">价格 & 库存</text>
								<view class="inline-fields" style="flex:1;">
									<view class="inline-field" style="flex:1;">
										<view class="price-input-box" style="flex:1;">
											<text class="price-symbol">¥</text>
											<input class="price-input" v-model="noIsbnPrice" placeholder="售价" type="digit" />
										</view>
									</view>
									<view class="inline-field" style="flex:1;">
										<input class="form-input" v-model="noIsbnStock" type="number" placeholder="库存" style="flex:1;" />
									</view>
								</view>
							</view>
						</view>

						<!-- ===== 图书详情 ===== -->
						<view class="info-block" style="margin-top:16rpx;">
							<!-- 作者 -->
							<view class="info-inline-row">
								<text class="info-inline-label">作者</text>
								<view class="dropdown-wrapper" style="flex:1;">
									<input class="form-input" v-model="noIsbnAuthor" placeholder="请输入作者" style="flex:1;" />
									<view class="dropdown-btn" @click.stop="noIsbnAuthorDropdownVisible = !noIsbnAuthorDropdownVisible">▼</view>
									<view v-if="noIsbnAuthorDropdownVisible && noIsbnAuthorOptions.length > 0" class="dropdown-list">
										<view class="dropdown-item" v-for="(item, idx) in noIsbnAuthorOptions" :key="idx" @click="selectNoIsbnAuthor(item)">{{ item }}</view>
									</view>
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 出版社 -->
							<view class="info-inline-row">
								<text class="info-inline-label">出版社</text>
								<view class="dropdown-wrapper" style="flex:1;">
									<input class="form-input" v-model="noIsbnPublisher" placeholder="请输入出版社" style="flex:1;" />
									<view class="dropdown-btn" @click.stop="noIsbnPublisherDropdownVisible = !noIsbnPublisherDropdownVisible">▼</view>
									<view v-if="noIsbnPublisherDropdownVisible && noIsbnPublisherOptions.length > 0" class="dropdown-list">
										<view class="dropdown-item" v-for="(item, idx) in noIsbnPublisherOptions" :key="idx" @click="selectNoIsbnPublisher(item)">{{ item }}</view>
									</view>
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 印刷时间 -->
							<view class="info-inline-row">
								<text class="info-inline-label">印刷时间</text>
								<picker mode="multiSelector" :range="noIsbnPrintTimeColumns" @columnchange="onNoIsbnPrintTimeColumnChange" @change="onNoIsbnPrintTimeChange" :value="noIsbnPrintTimeIndexes" style="flex:1;">
									<view class="form-input picker-value-text">
										<text>{{ noIsbnPrintTime || '选择年/月' }}</text>
									</view>
								</picker>
							</view>

							<view class="info-block-divider"></view>

							<!-- 定价 -->
							<view class="info-inline-row">
								<text class="info-inline-label">定价</text>
								<view class="price-input-box" style="flex:1;">
									<text class="price-symbol">¥</text>
									<input class="price-input" v-model="noIsbnOriginalPrice" placeholder="请输入定价" type="digit" />
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 书号 -->
							<view class="info-inline-row">
								<text class="info-inline-label">书号</text>
								<input class="form-input" v-model="noIsbnUnifyIsbn" placeholder="请输入统一书号" style="flex:1;" />
							</view>

							<view class="info-block-divider"></view>

							<!-- ISBN -->
							<view class="info-inline-row">
								<text class="info-inline-label">ISBN</text>
								<input class="form-input" v-model="noIsbnIsbn" placeholder="请输入ISBN" type="number" style="flex:1;" />
							</view>

							<view class="info-block-divider"></view>

							<!-- 图书分类 -->
							<view class="info-inline-row">
								<text class="info-inline-label">图书分类</text>
								<view style="flex:1;">
									<picker v-if="noIsbnCategoryColumns.length > 0" mode="multiSelector" :range="noIsbnCategoryColumns" range-key="name" @columnchange="onNoIsbnCategoryColumnChange" @change="onNoIsbnCategoryChange" :value="noIsbnCategoryIndexes">
										<view class="category-select">
											<text class="category-value">{{ noIsbnCategoryPathText || '请选择分类' }}</text>
											<text class="picker-arrow">›</text>
										</view>
									</picker>
									<view v-else-if="noIsbnCategoryLoading" class="category-select">
										<text class="category-value" style="color:#999;">加载中...</text>
									</view>
									<view v-else class="category-select" @click="loadNoIsbnCategory">
										<text class="category-value" style="color:#999;">点击加载分类</text>
										<text class="picker-arrow">›</text>
									</view>
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 装订 -->
							<view class="info-inline-row">
								<text class="info-inline-label">装订</text>
								<view class="dropdown-wrapper" style="flex:1;">
									<input class="form-input" v-model="noIsbnBinding" placeholder="请选择装订" style="flex:1;" />
									<view class="dropdown-btn" @click.stop="noIsbnBindingDropdownVisible = !noIsbnBindingDropdownVisible">▼</view>
									<view v-if="noIsbnBindingDropdownVisible" class="dropdown-list">
										<view class="dropdown-item" v-for="(item, idx) in noIsbnBindingOptions" :key="idx" @click="selectNoIsbnBinding(item)">{{ item }}</view>
									</view>
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 开本 -->
							<view class="info-inline-row">
								<text class="info-inline-label">开本</text>
								<view class="dropdown-wrapper" style="flex:1;">
									<input class="form-input" v-model="noIsbnFormat" placeholder="请选择开本" style="flex:1;" />
									<view class="dropdown-btn" @click.stop="noIsbnFormatDropdownVisible = !noIsbnFormatDropdownVisible">▼</view>
									<view v-if="noIsbnFormatDropdownVisible" class="dropdown-list">
										<view class="dropdown-item" v-for="(item, idx) in noIsbnFormatOptions" :key="idx" @click="selectNoIsbnFormat(item)">{{ item }}</view>
									</view>
								</view>
							</view>

							<view class="info-block-divider"></view>

							<!-- 字数 -->
							<view class="info-inline-row">
								<text class="info-inline-label">字数</text>
								<input class="form-input" v-model="noIsbnWordCount" placeholder="请输入字数" type="number" style="flex:1;" />
							</view>
						</view>

						<!-- ===== 拍照 ===== -->
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

						<!-- ===== 在售商品 ===== -->
						<view class="form-section" v-if="noIsbnProductList.length > 0">
							<!-- 市场统计 -->
							<view class="market-stats">
								<view class="stat-item">
									<text class="stat-label">在售</text>
									<text class="stat-value">{{ noIsbnMarketData.onSale }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">旧</text>
									<text class="stat-value">{{ noIsbnMarketData.old }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">新</text>
									<text class="stat-value">{{ noIsbnMarketData.new }}</text>
								</view>
								<view class="stat-item">
									<text class="stat-label">已售</text>
									<text class="stat-value">{{ noIsbnMarketData.sold }}</text>
								</view>
							</view>
							<view class="info-block-divider" style="margin:14rpx 0;"></view>
							<view class="section-header-row">
								<view class="section-title">
									<text class="title-text">在售商品</text>
								</view>
								<view class="copyright-btn" @click="searchNoIsbnCopyright">
									<text class="copyright-btn-text">版权页比价</text>
								</view>
							</view>
							<view class="loading-box" v-if="noIsbnLoading">
								<view class="loading-spinner"></view>
								<text class="loading-text">正在比价...</text>
							</view>
							<view class="product-grid" v-else>
								<view class="grid-item" v-for="(item, index) in noIsbnProductList" :key="index">
									<image class="grid-image" :src="item.image" mode="aspectFill" @click="previewProductImage(index)" v-if="item.image"></image>
									<text class="grid-book-name">{{ item.bookName || '未知书名' }}</text>
									<text class="grid-author">{{ item.author || '' }}</text>
									<text class="grid-total-price">¥{{ item.totalPrice.toFixed(2) }}</text>
									<text class="grid-price-detail">书¥{{ item.bookPrice.toFixed(2) }}+运¥{{ item.shippingFee.toFixed(2) }}</text>
									<text class="grid-condition">{{ item.condition || '' }}</text>
									<text class="grid-shop">{{ item.shopName || '' }}</text>
								</view>
								<view class="no-data" v-if="noIsbnProductList.length === 0">
									<text class="no-data-text">暂无在售商品</text>
								</view>
							</view>
						</view>

						<!-- ===== 上书记录 ===== -->
						<view class="form-section" v-if="noIsbnHistoryList.length > 0">
							<view class="section-title">
								<text class="title-text">上书记录</text>
							</view>
							<view class="history-list">
								<view class="history-item" v-for="(item, index) in noIsbnHistoryList" :key="index">
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
			</view>		<!-- /tab-panel 无ISBN -->

			<!-- 设置内容 -->
			<view class="tab-panel" v-show="swiperIndex === 2">
				<view class="tab-content">
					<view class="settings-swiper">
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
										<!-- 已保存账号列表 -->
										<view class="saved-accounts" v-if="savedAccountList.length > 0">
											<view class="saved-header">
												<text class="saved-title">已保存账号</text>
												<text class="saved-count">{{ savedAccountList.length }}个</text>
											</view>
											<view class="saved-list">
												<view
													class="saved-item"
													v-for="(acc, idx) in savedAccountList"
													:key="idx"
													@click="quickLogin(acc)"
												>
													<view class="saved-item-left">
														<view class="saved-avatar">&#128100;</view>
														<view class="saved-info">
															<text class="saved-name">{{ acc.username }}</text>
															<text class="saved-hint">点击直接登录</text>
														</view>
													</view>
													<text class="saved-del" @click.stop="deleteSavedAccount(idx)">删除</text>
												</view>
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
											<text class="title-text">定价策略</text>
										</view>
										<text class="section-desc">设置自动定价规则，影响比价结果的参考价格计算</text>
										
										<!-- 模式切换 -->
										<view class="mode-tabs">
											<view class="mode-tab" :class="{ active: priceMode === 'lowest' }" @click="priceMode = 'lowest'">
												<text class="mode-tab-text">最低价</text>
											</view>
											<view class="mode-tab" :class="{ active: priceMode === 'average' }" @click="priceMode = 'average'">
												<text class="mode-tab-text">均价</text>
											</view>
										</view>
										
										<!-- 最低价模式 -->
										<view v-if="priceMode === 'lowest'">
											<view class="config-field">
												<text class="config-label">以最低价为参照物（第{{ lowestRank }}条）</text>
												<text class="config-desc">选择第几条数据作为参考价</text>
												<view class="picker-wrap">
													<picker :value="lowestRank - 1" :range="lowestOptions" @change="e => lowestRank = e.detail.value + 1">
														<view class="picker-btn">
															<text class="picker-btn-text">第 {{ lowestRank }} 条</text>
															<text class="picker-arrow">›</text>
														</view>
													</picker>
												</view>
											</view>
											<view class="config-field">
												<text class="config-label">运费</text>
												<text class="config-desc">每单运费金额</text>
												<input class="num-input-field" v-model="shippingFee" type="digit" placeholder="0.00" @input="onDecimalInput('shippingFee', $event)" />
											</view>
											<view class="config-field">
												<text class="config-label">占位降价</text>
												<text class="config-desc">在参考价基础上降低的金额</text>
												<input class="num-input-field" v-model="priceDiscount" type="digit" placeholder="0.00" @input="onDecimalInput('priceDiscount', $event)" />
											</view>
											<view class="config-field">
												<text class="config-label">最低书价（不含运费）</text>
												<text class="config-desc">设置后的价格不低于此金额</text>
												<input class="num-input-field" v-model="minBookPrice" type="digit" placeholder="0.00" @input="onDecimalInput('minBookPrice', $event)" />
											</view>
										</view>
										
										<!-- 均价模式 -->
										<view v-if="priceMode === 'average'">
											<view class="config-field">
												<text class="config-label">以总价最低的{{ averageCount }}个价格平均值为参考物</text>
												<text class="config-desc">选择前{{ averageCount }}条数据取平均值</text>
												<view class="picker-wrap">
													<picker :value="averageCount - 2" :range="averageOptions" @change="e => averageCount = e.detail.value + 2">
														<view class="picker-btn">
															<text class="picker-btn-text">前 {{ averageCount }} 条</text>
															<text class="picker-arrow">›</text>
														</view>
													</picker>
												</view>
											</view>
											<view class="config-field">
												<text class="config-label">运费</text>
												<text class="config-desc">每单运费金额</text>
												<input class="num-input-field" v-model="shippingFee" type="digit" placeholder="0.00" @input="onDecimalInput('shippingFee', $event)" />
											</view>
											<view class="config-field">
												<text class="config-label">占位降价</text>
												<text class="config-desc">在参考价基础上降低的金额</text>
												<input class="num-input-field" v-model="priceDiscount" type="digit" placeholder="0.00" @input="onDecimalInput('priceDiscount', $event)" />
											</view>
											<view class="config-field">
												<text class="config-label">最低书价（不含运费）</text>
												<text class="config-desc">设置后的价格不低于此金额</text>
												<input class="num-input-field" v-model="minBookPrice" type="digit" placeholder="0.00" @input="onDecimalInput('minBookPrice', $event)" />
											</view>
										</view>
										
										<view class="save-config-btn" @click="savePriceConfig">
											<text>保存设置</text>
										</view>
									</view>
								</scroll-view>
							</swiper-item>
						</swiper>
					</view>
				</view>
			</view>		<!-- /tab-panel 设置 -->
		</view>		<!-- /tab-swiper -->

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
					<text class="popup-title">筛选在售商品</text>
					<text class="popup-close" @click="showFilterPopup = false">✕</text>
				</view>
				<view class="popup-body">
					<view class="filter-group" v-if="filterPublishers.length > 0">
						<text class="group-title">出版社</text>
						<view class="tag-list">
							<view 
								class="tag-item" 
								v-for="(item, index) in filterPublishers" 
								:key="'p'+index"
								:class="{ active: filterPress === item }"
								@click="filterPress = filterPress === item ? '' : item"
							>
								<text class="tag-text">{{ item }}</text>
							</view>
						</view>
					</view>
					<view class="filter-group" v-if="filterAuthors.length > 0">
						<text class="group-title">作者</text>
						<view class="tag-list">
							<view 
								class="tag-item" 
								v-for="(item, index) in filterAuthors" 
								:key="'a'+index"
								:class="{ active: filterAuthor === item }"
								@click="filterAuthor = filterAuthor === item ? '' : item"
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
					<!-- 货位搜索 -->
					<view class="wh-search-bar">
						<input class="wh-search-input" v-model="popupLocationSearch" placeholder="搜索货位编码/名称" @input="onLocationSearchInput" />
						<text class="wh-search-clear" v-if="popupLocationSearch" @click="clearLocationSearch">✕</text>
						<text class="wh-scan-btn" @click="scanLocationBarcode">📷</text>
					</view>
					<scroll-view class="wh-location-list" scroll-y :refresher-enabled="true" :refresher-triggered="popupRefreshing" @refresherrefresh="onPopupRefresh" @scrolltolower="loadMorePopupLocation">
						<view 
							class="wh-loc-item" 
							v-for="loc in filteredLocationList" 
							:key="loc.id"
							:class="{ active: popupSelectedLoc && popupSelectedLoc.id === loc.id }"
							@click="selectPopupLocation(loc)"
						>
							<text class="wh-loc-code">{{ loc.code }}</text>
							<text class="wh-loc-check" v-if="popupSelectedLoc && popupSelectedLoc.id === loc.id">✓</text>
						</view>
						<view class="popup-loading" v-if="popupLocLoadingMore">
							<view class="mini-spinner"></view>
							<text>加载中...</text>
						</view>
						<view class="popup-hint-end" v-if="!popupLocHasMore && popupLocationList.length > 0">
							<text>— 已全部加载 —</text>
						</view>
						<view class="popup-hint" v-if="filteredLocationList.length === 0 && !popupLoadingLocation">
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
		
		<!-- 扫码结果弹窗 -->
		<view class="scan-result-overlay" v-if="showScanPopup" @click="closeScanPopup">
			<view class="scan-result-popup" @click.stop>
				<view class="popup-scan-header">
					<text class="popup-scan-title">扫码结果</text>
					<text class="popup-scan-close" @click="closeScanPopup">✕</text>
				</view>
				<view class="popup-scan-content">
					<view class="scan-result-row" v-if="scanPopupWhCode">
						<text class="scan-result-label">仓库编码</text>
						<text class="scan-result-value">{{ scanPopupWhCode }}</text>
					</view>
					<view class="scan-result-row" v-if="scanPopupLocCode">
						<text class="scan-result-label">货位号</text>
						<text class="scan-result-value">{{ scanPopupLocCode }}</text>
					</view>
					<view class="scan-result-row" v-if="!scanPopupWhCode && !scanPopupLocCode">
						<text class="scan-result-label">条码内容</text>
						<text class="scan-result-value">{{ scanPopupRaw }}</text>
					</view>
					<text class="scan-result-hint">点击「搜索」查询匹配货位</text>
				</view>
				<view class="popup-scan-footer">
					<view class="popup-scan-btn popup-scan-cancel" @click="closeScanPopup">取消</view>
					<view class="popup-scan-btn popup-scan-confirm" @click="confirmScanSearch">搜索</view>
				</view>
			</view>
		</view>

		<!-- 无ISBN已有图书选择弹窗 -->
		<view class="noisbn-book-mask" v-if="noIsbnBookPopupVisible" @click="closeNoIsbnBookPopup">
			<view class="noisbn-book-popup" @click.stop>
				<view class="noisbn-book-header">
					<text class="noisbn-book-title">已查到 {{ noIsbnBookList.length }} 条记录，点击选择</text>
					<text class="noisbn-book-close" @click="closeNoIsbnBookPopup">✕</text>
				</view>
				<scroll-view class="noisbn-book-scroll" scroll-y>
					<view class="noisbn-book-item" v-for="(item, idx) in noIsbnBookList" :key="idx" @click="selectNoIsbnBookItem(item)">
						<view class="noisbn-book-item-num">{{ idx + 1 }}</view>
						<view class="noisbn-book-item-body">
							<view class="noisbn-book-item-name">{{ item.book_name || '' }}</view>
							<view class="noisbn-book-item-meta" v-if="item.author || item.publishing || item.isbn">
								<text v-if="item.author" class="meta-tag">作者:{{ item.author }}</text>
								<text v-if="item.publishing" class="meta-tag">出版社:{{ item.publishing }}</text>
								<text v-if="item.isbn" class="meta-tag">ISBN:{{ item.isbn }}</text>
							</view>
						</view>
						<text class="noisbn-book-item-arrow">›</text>
					</view>
				</scroll-view>
				<view class="noisbn-book-footer">
					<view class="noisbn-book-btn noisbn-book-cancel" @click="closeNoIsbnBookPopup">取消</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { getWarehouseList, getLocationList, searchBookByIsbn, calculateSign } from '@/utils/api.js'
import { login as kongfzLogin, searchProducts, searchFacet } from '@/utils/kongfz.js'
import { uploadImages } from '@/utils/minio.js'

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
			stock: 1,
			selectedCondition: '八五品',
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
			noIsbnPrintTimeIndexes: [0, 0],
			noIsbnBookName: '',
			noIsbnAuthor: '',
			noIsbnPublisher: '',
			noIsbnFormat: '',
			noIsbnBinding: '',
			noIsbnOriginalPrice: '',
			noIsbnWordCount: '',
			noIsbnIsbn: '',
			noIsbnUnifyIsbn: '',
			noIsbnSelectedCondition: '八五品',
			noIsbnPrice: '',
			noIsbnStock: 1,
			noIsbnPhotoList: [],
			noIsbnSelectedArea: '',
			noIsbnWarehouseData: null,
			capturedPhotoList: null,
			
			// 无ISBN - 下拉列表
			noIsbnAuthorOptions: [],
			noIsbnAuthorDropdownVisible: false,
			noIsbnPublisherOptions: [],
			noIsbnPublisherDropdownVisible: false,
			noIsbnFormatDropdownVisible: false,
			noIsbnBindingDropdownVisible: false,

			// 开本选项（无ISBN专用）
			noIsbnFormatOptions: ['2', '4', '6', '8', '12', '16', '18', '20', '24', '32', '36', '40', '42', '48', '50', '60', '64', '72', '大16', '大32', '其他'],

			// 装订选项（无ISBN专用）
			noIsbnBindingOptions: ['平装', '精装', '软精装', '线装', '其他'],

			// 无ISBN已有图书弹窗
			noIsbnBookPopupVisible: false,
			noIsbnBookList: [],
			
			// 分类（从API加载）
			noIsbnCategoryData: [],
			noIsbnCategoryColumns: [],
			noIsbnCategoryIndexes: [],
			noIsbnCategoryLevels: [],
			noIsbnMaxCategoryLevel: 3,
			noIsbnCategoryPathText: '',
			noIsbnCategoryLoading: false,
			noIsbnSelectedCategoryId: '',
			
			// 无ISBN - 市场竞争/在售
			noIsbnProductList: [],
			noIsbnHistoryList: [],
			noIsbnLoading: false,
			noIsbnMarketData: { onSale: 0, old: 0, new: 0, sold: 0 },

			// 筛选
			showFilterPopup: false,
			filterPress: '',
			filterAuthor: '',
			
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
			popupLocationSearch: '',
			popupAllLocationList: [],
			popupLocTotal: 0,
			popupRefreshing: false,
			_pendingPreselectWh: null,
			_pendingPreselectLoc: null,
			
			// 扫码弹窗
			showScanPopup: false,
			scanPopupWhCode: '',
			scanPopupLocCode: '',
			scanPopupRaw: '',
			
			// 登录
			isLoggedIn: false,
			shopName: '',
			shopRegion: '',
			loginAccount: '',
			loginPassword: '',
			showPassword: false,
			rememberPassword: false,
			blockedList: '',
			kongfzToken: '',
			savedAccountList: [],
			
			// 定价策略
			priceMode: 'lowest',  // lowest | average
			lowestRank: 1,
			averageCount: 2,
			shippingFee: 0,
			priceDiscount: 0,
			minBookPrice: 0
		}
	},

	onLoad(options) {
		uni.setNavigationBarTitle({ title: '图书上传' })
		if (options && options.tab) {
			this.currentTab = options.tab
			this.swiperIndex = options.tab === 'no-isbn' ? 1 : 0
		}
		// 恢复登录状态
		const savedToken = uni.getStorageSync('kongfz_phpsessid')
		const savedName = uni.getStorageSync('kongfz_shop_name')
		if (savedToken && savedName) {
			this.kongfzToken = savedToken
			this.shopName = savedName
			this.shopRegion = uni.getStorageSync('kongfz_shop_region') || '孔夫子旧书网'
			this.isLoggedIn = true
		}
		// 恢复记住的账号
		const remembered = uni.getStorageSync('kongfz_remembered_account')
		if (remembered) {
			this.loginAccount = remembered
			this.rememberPassword = true
		}
		// 加载已保存账号列表
		this.loadSavedAccounts()
		// 恢复定价策略配置
		this.loadPriceConfig()
		// 预加载图书分类
		this.loadNoIsbnCategory()
		// 初始化印刷时间选择器默认值
		this.syncNoIsbnPrintTimeIndexes()
		// 恢复选择的仓库货位
		const savedWhData = uni.getStorageSync('selectedWarehouseData')
		if (savedWhData) {
			const locationText = savedWhData.warehouseName + ' - ' + savedWhData.locationCode
			const whData = {
				warehouseId: savedWhData.warehouseId,
				warehouseName: savedWhData.warehouseName,
				warehouseCode: savedWhData.warehouseCode,
				locationId: savedWhData.locationId,
				locationName: savedWhData.locationName,
				locationCode: savedWhData.locationCode,
				code: savedWhData.locationCode,
				name: savedWhData.locationName
			}
			this.isbnSelectedArea = locationText
			this.isbnWarehouseData = whData
			this.noIsbnSelectedArea = locationText
			this.noIsbnWarehouseData = whData
		}
	},

	computed: {
		conditionValue() {
			const map = {
				'全新': '100~',
				'九五品': '95~',
				'九品': '90~',
				'八五品': '85~',
				'八品': '80~',
				'七品': '70~',
				'六品': '60~'
			}
			return this.selectedCondition ? (map[this.selectedCondition] || '') : ''
		},
		noIsbnConditionValue() {
			const map = {
				'全新': '100~',
				'九五品': '95~',
				'九品': '90~',
				'八五品': '85~',
				'八品': '80~',
				'七品': '70~',
				'六品': '60~'
			}
			return this.noIsbnSelectedCondition ? (map[this.noIsbnSelectedCondition] || '') : ''
		},
		calculatedPrice() {
			const sorted = this.sortedProductList
			if (sorted.length === 0) return 0
			const shipping = Number(this.shippingFee) || 0
			const discount = Number(this.priceDiscount) || 0
			const minPrice = Number(this.minBookPrice) || 0
			let result = 0
			if (this.priceMode === 'lowest') {
				const idx = Math.min((Number(this.lowestRank) || 1) - 1, sorted.length - 1)
				const selectedTotal = parseFloat(sorted[idx].totalPrice) || 0
				result = selectedTotal - shipping - discount
			} else {
				const count = Math.min(Number(this.averageCount) || 2, sorted.length)
				let sum = 0
				for (let i = 0; i < count; i++) {
					sum += parseFloat(sorted[i].totalPrice) || 0
				}
				result = (sum / count) - shipping - discount
			}
			if (result <= minPrice) return minPrice
			return parseFloat(result.toFixed(2))
		},
		sortedProductList() {
			let list = [...this.productList]
			// 筛选（精确匹配，同zhizhu）
			if (this.filterPress) {
				list = list.filter(item => item.press === this.filterPress)
			}
			if (this.filterAuthor) {
				list = list.filter(item => item.author === this.filterAuthor)
			}
			// 排序
			if (this.sortBy === 'total') {
				list.sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice))
			} else if (this.sortBy === 'book') {
				list.sort((a, b) => parseFloat(a.bookPrice || 0) - parseFloat(b.bookPrice || 0))
			}
			return list
		},
		// 无ISBN - 按售价策略排序的商品列表
		noIsbnSortedProductList() {
			let list = [...this.noIsbnProductList].slice(0, 12)
			list.sort((a, b) => parseFloat(a.totalPrice) - parseFloat(b.totalPrice))
			return list
		},
		// 无ISBN - 自动计算售价（策略与ISBN页一致）
		calculatedNoIsbnPrice() {
			const sorted = this.noIsbnSortedProductList
			if (sorted.length === 0) return 0
			const shipping = Number(this.shippingFee) || 0
			const discount = Number(this.priceDiscount) || 0
			const minPrice = Number(this.minBookPrice) || 0
			let result = 0
			if (this.priceMode === 'lowest') {
				const idx = Math.min((Number(this.lowestRank) || 1) - 1, sorted.length - 1)
				const selectedTotal = parseFloat(sorted[idx].totalPrice) || 0
				result = selectedTotal - shipping - discount
			} else {
				const count = Math.min(Number(this.averageCount) || 2, sorted.length)
				let sum = 0
				for (let i = 0; i < count; i++) {
					sum += parseFloat(sorted[i].totalPrice) || 0
				}
				result = (sum / count) - shipping - discount
			}
			if (result <= minPrice) return minPrice
			return parseFloat(result.toFixed(2))
		},
		filterPublishers() {
			const set = new Set()
			this.productList.slice(0, 12).forEach(item => {
				if (item.press) set.add(item.press)
			})
			return Array.from(set)
		},
		filterAuthors() {
			const set = new Set()
			this.productList.slice(0, 12).forEach(item => {
				if (item.author) set.add(item.author)
			})
			return Array.from(set)
		},
		lowestOptions() {
			const arr = []
			for (let i = 1; i <= 12; i++) arr.push(i)
			return arr
		},
		averageOptions() {
			const arr = []
			for (let i = 2; i <= 12; i++) arr.push(i)
			return arr
		},
		noIsbnYearOptions() {
			const arr = []
			const cur = new Date().getFullYear()
			for (let i = 800; i <= cur; i++) arr.push(String(i))
			return arr
		},
		noIsbnMonthOptions() {
			const arr = []
			for (let i = 1; i <= 12; i++) arr.push(String(i).padStart(2, '0'))
			return arr
		},
		noIsbnPrintTimeColumns() {
			return [this.noIsbnYearOptions, this.noIsbnMonthOptions]
		},
		filteredLocationList() {
			if (!this.popupLocationSearch) return this.popupLocationList
			const kw = this.popupLocationSearch.toLowerCase()
			return this.popupAllLocationList.filter(loc => {
				const code = (loc.code || '').toLowerCase()
				const name = (loc.name || '').toLowerCase()
				return code.includes(kw) || name.includes(kw)
			})
		}
	},

	watch: {
		noIsbnSelectedCondition() {
			// 品相变化时重新搜索在售商品（无ISBN页）
			if (this.noIsbnProductList.length > 0 && this.noIsbnBookName && this.isLoggedIn) {
				this.searchNoIsbn()
			}
		},
		selectedCondition() {
			// 品相变化时重新搜索在售商品（ISBN页）
			if (this.productList.length > 0 && this.isbn && this.isLoggedIn) {
				this.searchISBN()
			}
		},
		noIsbnPrintTime() {
			this.syncNoIsbnPrintTimeIndexes()
		},
		noIsbnUnifyIsbn(val) {
			// 10位书号（ISBN-10）自动转为13位ISBN填入ISBN字段
			// 去掉分隔符（-、空格）后检测是否为10位ISBN
			var clean = (val || '').replace(/[-\s]/g, '')
			if (clean.length === 10 && /^\d{9}[\dXx]$/i.test(clean)) {
				if (!this.noIsbnIsbn) {
					this.noIsbnIsbn = this.convertIsbn10To13(clean)
				}
			}
		}
	},

	// 页面显示时处理连拍返回的照片
	onShow() {
		if (this.capturedPhotoList && this.capturedPhotoList.length > 0) {
			var photos = this.capturedPhotoList
			this.noIsbnPhotoList = [...this.noIsbnPhotoList, ...photos]
			this.capturedPhotoList = null
		}
	},

	methods: {
		// ISBN-10 转 ISBN-13
		convertIsbn10To13(clean) {
			if (!clean || clean.length !== 10) return ''
			// 前9位 + 前缀978
			var digits = '978' + clean.slice(0, 9)
			// 计算ISBN-13校验码
			var sum = 0
			for (var i = 0; i < 12; i++) {
				var digit = parseInt(digits[i], 10)
				sum += i % 2 === 0 ? digit : digit * 3
			}
			var check = (10 - (sum % 10)) % 10
			return digits + check
		},

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
			// 必须已登录孔网
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录孔网账号', icon: 'none' })
				return
			}
			// 手机系统原生扫码（实时识别，对准即出结果）
			uni.scanCode({
				onlyFromCamera: true,
				scanType: ['barcode'],
				success: (res) => {
					this.isbn = (res.result || '').trim()
					this.searchISBN()
				},
				fail: () => {}
			})
		},

		// ISBN搜索 - 查询图书中心 + 孔网市场
		searchISBN() {
			// 必须已登录孔网
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录孔网账号', icon: 'none' })
				return
			}
			let keyword = ''
			if (this.compareType === 'isbn') {
				if (!this.isbn) {
					uni.showToast({ title: '请输入ISBN', icon: 'none' })
					return
				}
				keyword = this.isbn
			} else {
				if (!this.bookName) {
					uni.showToast({ title: '请输入书名', icon: 'none' })
					return
				}
				keyword = this.bookName
			}
			this.isLoading = true
			this.productList = []

			// 1. 查询图书中心 - 获取图书详情（仅ISBN模式）
			if (this.compareType === 'isbn') {
				searchBookByIsbn(this.isbn).then(data => {
					if (data.book_name) this.bookName = data.book_name
					if (data.author) this.author = data.author
					if (data.publisher) this.publisher = data.publisher
					if (data.fix_price && data.fix_price > 0) {
						this.fixPrice = (data.fix_price / 100).toFixed(2)
					}
					if (data.publication_time) this.printTime = data.publication_time
					if (data.binding_layout) this.noIsbnFormat = data.binding_layout
					console.log('图书中心查询成功:', data)
				}).catch(err => {
					console.log('图书中心查询无结果:', err)
				})
			}

			// 2. 搜索孔夫子 - 获取在售商品信息
			const phpsessid = this.kongfzToken || uni.getStorageSync('kongfz_phpsessid') || ''
			// 排序参数：7=总价从低到高(含运费) 5=书价从低到高
			const sortType = this.sortBy === 'book' ? '5' : '7'
			// 并行请求：商品列表 + 品相统计（在售）+ 品相统计（已售）
			Promise.all([
				searchProducts(keyword, { phpsessid, sortType, quality: this.conditionValue }),
				searchFacet(keyword, { phpsessid, dataType: 0 }),
				searchFacet(keyword, { phpsessid, dataType: 1 })
			]).then(([productsData, onSaleFacet, soldFacet]) => {
				this.isLoading = false
				if (productsData && productsData.total > 0) {
					// 在售商品列表（最多12条）
					const list = (productsData.list || []).slice(0, 12)
					this.productList = list.map(item => {
						const cleanPrice = parseFloat((item.priceText || '0').replace(/[^\d.]/g, ''))
						let shippingFee = 0
						// 多种格式兼容处理运费
						if (item.postage) {
							if (typeof item.postage === 'number' || typeof item.postage === 'string') {
								// 运费直接是数字/字符串
								shippingFee = parseFloat(item.postage) || 0
							} else if (item.postage.shippingList && item.postage.shippingList.length > 0) {
								// 标准格式: postage.shippingList[0].shippingFee
								shippingFee = parseFloat(item.postage.shippingList[0].shippingFee || 0)
							} else if (item.postage.shippingFee) {
								// 扁平格式: postage.shippingFee
								shippingFee = parseFloat(item.postage.shippingFee || 0)
							}
						}
						// 也检查顶层字段
						if (shippingFee === 0 && item.shippingFee) {
							shippingFee = parseFloat(item.shippingFee) || 0
						}
						const totalPrice = Number((cleanPrice + shippingFee).toFixed(2))
						return {
							image: item.imgBigUrl || '',
							totalPrice: totalPrice,
							bookPrice: cleanPrice,
							shippingFee: shippingFee,
							condition: item.qualityText || '',
							shopName: item.shopName || '',
							bookName: item.title || '',
							author: item.author || '',
							press: item.press || '',
							pubDate: item.pubDateText || '',
							bookId: item.id || ''
						}
					})
					// 自动填充计算价格
					this.$nextTick(() => {
						if (this.calculatedPrice > 0) {
							this.price = String(this.calculatedPrice)
						}
					})
				}
				// 市场统计：使用facet接口的真实数据（totalFound为准）
				this.marketData = {
					onSale: onSaleFacet ? onSaleFacet.totalFound : (productsData ? productsData.total : 0),
					old: onSaleFacet ? onSaleFacet.oldCount : 0,
					new: onSaleFacet ? onSaleFacet.newCount : 0,
					sold: soldFacet ? (soldFacet.oldCount + soldFacet.newCount) : 0
				}
			}).catch(() => {
				this.isLoading = false
				this.marketData = { onSale: 0, old: 0, new: 0, sold: 0 }
			})
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
		// 无ISBN - 打开连拍页面
		openCameraCapture() {
			uni.navigateTo({
				url: 'camera_capture'
			})
		},

		deleteNoIsbnPhoto(index) {
			this.noIsbnPhotoList.splice(index, 1)
		},

		// 仓库弹窗
		openWarehousePicker(tab) {
			this.pickerTargetTab = tab
			this.showWarehousePicker = true
			const savedData = tab === 'isbn' ? this.isbnWarehouseData : this.noIsbnWarehouseData
			this._pendingPreselectWh = savedData ? savedData.warehouseId : null
			this._pendingPreselectLoc = savedData ? savedData.locationId : null
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
				console.log('仓库列表原始响应:', JSON.stringify(res))
				const list = res.data?.list || res.data?.records || res.list || res.records || []
				if (list.length > 0) {
					this.popupWarehouseList = list
					// 默认选中第一个仓库
					let whIdx = 0
					const preselectWhId = this._pendingPreselectWh
					if (preselectWhId) {
						const foundIdx = list.findIndex(w => w.id === preselectWhId)
						if (foundIdx !== -1) whIdx = foundIdx
					}
					this.popupActiveWhIndex = whIdx
					this.popupSelectedWh = list[whIdx]
					this.popupSelectedLoc = null
					await this.loadPopupLocations(list[whIdx].id)
					// 加载完货位后根据已选ID自动选中
					const preselectLocId = this._pendingPreselectLoc
					if (preselectLocId && this.popupLocationList.length > 0) {
						const foundLoc = this.popupLocationList.find(l => l.id === preselectLocId)
						if (foundLoc) {
							this.popupSelectedLoc = foundLoc
						}
					}
					this._pendingPreselectWh = null
					this._pendingPreselectLoc = null
				} else {
					console.warn('仓库列表为空, 响应code:', res.code, '响应data:', JSON.stringify(res.data))
				}
			} catch (e) {
				console.error('加载仓库失败:', e)
				const errMsg = e.message || String(e)
				if (errMsg.includes('NEED_LOGIN')) {
					uni.showModal({
						title: '系统提示',
						content: 'PSI系统登录已过期，请重新登录',
						confirmText: '去登录',
						cancelText: '取消',
						success: (modalRes) => {
							if (modalRes.confirm) {
								uni.removeStorageSync('token')
								uni.removeStorageSync('warehouseList')
								uni.removeStorageSync('aboutId')
								uni.navigateTo({ url: '/pages/login/login' })
							}
						}
					})
				}
			} finally {
				this.popupLoading = false
			}
		},

		async loadPopupLocations(warehouseId, keepExisting = false, searchKeyword = '') {
			if (!keepExisting) {
				this.popupLoadingLocation = true
				this.popupLocPage = 1
				this.popupLocHasMore = true
				this.popupAllLocationList = []
				this.popupLocTotal = 0
			}
			try {
				const params = {
					warehouse_id: warehouseId, type: 1, status: 1,
					page: this.popupLocPage, page_size: this.popupLocPageSize
				}
				// 如果传了搜索关键词,交给后端过滤
				if (searchKeyword) {
					params.code = searchKeyword
				}
				const res = await getLocationList(params)
				console.log('【货位列表】load响应:', JSON.stringify(res))
				// 兼容多种响应格式：{ code:0, data:{ list:[], total:100 } } 或直接 { list:[], total:100 }
				let newList = []
				let totalCount = 0
				if (res.code === 0 && res.data) {
					newList = res.data.list || res.data.records || []
					totalCount = res.data.total || 0
				} else if (res.list || res.records) {
					newList = res.list || res.records || []
					totalCount = res.total || 0
				}
				if (newList.length > 0) {
					if (keepExisting) {
						this.popupLocationList = [...this.popupLocationList, ...newList]
						this.popupAllLocationList = [...this.popupAllLocationList, ...newList]
					} else {
						this.popupLocationList = newList
						this.popupAllLocationList = newList
					}
					this.popupLocTotal = totalCount
					this.popupLocHasMore = this.popupLocPage * this.popupLocPageSize < totalCount
				} else {
					if (!keepExisting) {
						this.popupLocationList = []
						this.popupAllLocationList = []
					}
					this.popupLocHasMore = false
				}
			} catch (e) {
				console.error('加载货位失败:', e)
				const errMsg = e.message || String(e)
				if (errMsg.includes('NEED_LOGIN')) {
					uni.showModal({
						title: '系统提示',
						content: 'PSI系统登录已过期，请重新登录',
						confirmText: '去登录',
						cancelText: '取消',
						success: (modalRes) => {
							if (modalRes.confirm) {
								uni.removeStorageSync('token')
								uni.removeStorageSync('warehouseList')
								uni.removeStorageSync('aboutId')
								uni.navigateTo({ url: '/pages/login/login' })
							}
						}
					})
				}
				this.popupLocationList = this.popupAllLocationList
				this.popupLocHasMore = false
			} finally {
				if (!keepExisting) {
					this.popupLoadingLocation = false
				}
			}
		},

		selectPopupWarehouse(idx) {
			this.popupActiveWhIndex = idx
			const wh = this.popupWarehouseList[idx]
			if (wh) {
				this.popupSelectedWh = wh
				this.popupSelectedLoc = null
				this.popupLocationSearch = ''
				return this.loadPopupLocations(wh.id)
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

		// 下拉刷新货位列表
		async onPopupRefresh() {
			this.popupRefreshing = true
			this.popupLocationSearch = ''
			const wh = this.popupWarehouseList[this.popupActiveWhIndex]
			if (wh) {
				await this.loadPopupLocations(wh.id)
			}
			this.popupRefreshing = false
		},

		// 上拉加载更多
		loadMorePopupLocation() {
			if (!this.popupLocHasMore || this.popupLocLoadingMore) return
			this.popupLocLoadingMore = true
			this.popupLocPage++
			const wh = this.popupWarehouseList[this.popupActiveWhIndex]
			if (!wh) { this.popupLocLoadingMore = false; return }
			this.loadPopupLocations(wh.id, true).catch(() => {
				this.popupLocPage--
			}).finally(() => {
				this.popupLocLoadingMore = false
			})
		},

		// 货位搜索
		onLocationSearchInput() {
			if (this.popupLocationSearch) {
				const kw = this.popupLocationSearch.toLowerCase()
				this.popupLocationList = this.popupAllLocationList.filter(loc => {
					const code = (loc.code || '').toLowerCase()
					const name = (loc.name || '').toLowerCase()
					return code.includes(kw) || name.includes(kw)
				})
			} else {
				this.popupLocationList = [...this.popupAllLocationList]
			}
		},

		clearLocationSearch() {
			this.popupLocationSearch = ''
			this.popupLocationList = [...this.popupAllLocationList]
		},

		// 扫码识别货位（格式：仓库编码##货位号，如 NS##a5-4）
		async scanLocationBarcode() {
			uni.scanCode({
				onlyFromCamera: true,
				scanType: ['barcode'],
				success: async (res) => {
					const scanned = (res.result || '').trim()
					if (!scanned) return

					// 尝试解析 编码##货位号 格式
					const sepIdx = scanned.indexOf('##')
					if (sepIdx > 0) {
						const whCode = scanned.substring(0, sepIdx).trim()
						const locCode = scanned.substring(sepIdx + 2).trim()
						if (whCode && locCode) {
							this.scanPopupWhCode = whCode
							this.scanPopupLocCode = locCode
							this.scanPopupRaw = ''
							this.showScanPopup = true
							return
						}
					}

					// 纯条码格式
					this.scanPopupWhCode = ''
					this.scanPopupLocCode = ''
					this.scanPopupRaw = scanned
					this.showScanPopup = true
				},
				fail: () => {}
			})
		},

		closeScanPopup() {
			this.showScanPopup = false
		},

		async confirmScanSearch() {
			this.showScanPopup = false
			const whCode = this.scanPopupWhCode
			const locCode = this.scanPopupLocCode
			const raw = this.scanPopupRaw

			if (whCode && locCode) {
				// 格式 NS##a5-4 → 按仓库编码匹配仓库，切换tab，带着货位号请求后端过滤
				const whIdx = this.popupWarehouseList.findIndex(w => {
					const code = (w.code || '').toLowerCase()
					const name = (w.name || '').toLowerCase()
					const search = whCode.toLowerCase()
					return code === search || name === search || code.includes(search)
				})
				if (whIdx !== -1) {
					const wh = this.popupWarehouseList[whIdx]
					// 切换到该仓库 tab
					this.popupActiveWhIndex = whIdx
					this.popupSelectedWh = wh
					this.popupSelectedLoc = null
					this.popupLocationSearch = ''
					// 带着货位号请求后端过滤货位列表（重新请求接口）
					await this.loadPopupLocations(wh.id, false, locCode)
					if (this.popupLocationList.length > 0) {
						this.popupSelectedLoc = this.popupLocationList[0]
						uni.showToast({ title: '已匹配 仓库' + whCode + ' 货位:' + this.popupLocationList[0].code, icon: 'success' })
					} else {
						uni.showToast({ title: '已切换到仓库' + whCode + '，但未找到货位' + locCode, icon: 'none' })
					}
				} else {
					uni.showToast({ title: '未找到仓库: ' + whCode, icon: 'none' })
				}
			} else if (raw) {
				// 纯条码，在当前仓库的货位列表中查找
				const search = raw.toLowerCase()
				const matched = this.popupAllLocationList.find(l => {
					const code = (l.code || '').toLowerCase()
					const name = (l.name || '').toLowerCase()
					return code === search || name === search ||
						code.includes(search) || search.includes(code)
				})
				if (matched) {
					this.popupSelectedLoc = matched
					this.popupLocationSearch = ''
					this.popupLocationList = [...this.popupAllLocationList]
					uni.showToast({ title: '已选中货位: ' + matched.code, icon: 'success' })
				} else {
					uni.showToast({ title: '未找到匹配货位', icon: 'none' })
				}
			}
		},

		// 比价切换 - 切换后触发搜索
		switchCompare(type) {
			this.compareType = type
			this.searchISBN()
		},

		// 排序 - 切换后重新请求孔夫子接口
		sortProducts(by) {
			this.sortBy = by
			this.searchISBN()
		},

		// 筛选
		showMoreFilter() {
			this.showFilterPopup = true
		},

		resetFilter() {
			this.filterPress = ''
			this.filterAuthor = ''
		},

		applyFilter() {
			this.showFilterPopup = false
		},

		// 分类
		// 无ISBN - 分类选择器：列变化
		onNoIsbnCategoryColumnChange(e) {
			const { column, value } = e.detail
			this.noIsbnCategoryIndexes[column] = value
			this.noIsbnCategoryLevels[column] = this.noIsbnCategoryColumns[column][value]
			if (column < this.noIsbnMaxCategoryLevel - 1) {
				this.updateNoIsbnSubsequentColumns(column + 1)
			}
			this.updateNoIsbnCategoryPathText()
		},

		// 无ISBN - 分类选择器：确认选择
		onNoIsbnCategoryChange(e) {
			const values = e.detail.value
			this.noIsbnCategoryIndexes = [...values]
			for (let i = 0; i < values.length; i++) {
				if (this.noIsbnCategoryColumns[i] && this.noIsbnCategoryColumns[i][values[i]]) {
					this.noIsbnCategoryLevels[i] = this.noIsbnCategoryColumns[i][values[i]]
				}
			}
			this.updateNoIsbnCategoryPathText()
			this.updateNoIsbnSelectedCategoryId()
		},

		updateNoIsbnSubsequentColumns(startColumn) {
			const parentCategory = this.noIsbnCategoryLevels[startColumn - 1]
			if (!parentCategory || !parentCategory.children || parentCategory.children.length === 0) {
				for (let i = startColumn; i < this.noIsbnMaxCategoryLevel; i++) {
					this.noIsbnCategoryColumns[i] = [{ name: '暂无数据', id: '' }]
					this.noIsbnCategoryIndexes[i] = 0
					this.noIsbnCategoryLevels[i] = { name: '暂无数据', id: '' }
				}
				return
			}
			this.noIsbnCategoryColumns[startColumn] = parentCategory.children
			this.noIsbnCategoryIndexes[startColumn] = 0
			this.noIsbnCategoryLevels[startColumn] = parentCategory.children[0]
			if (startColumn < this.noIsbnMaxCategoryLevel - 1) {
				this.updateNoIsbnSubsequentColumns(startColumn + 1)
			}
		},

		updateNoIsbnCategoryPathText() {
			const validLevels = this.noIsbnCategoryLevels.filter(level => level && level.name && level.name !== '暂无数据')
			this.noIsbnCategoryPathText = validLevels.map(level => level.name).join(' / ')
		},

		updateNoIsbnSelectedCategoryId() {
			const validLevels = this.noIsbnCategoryLevels.filter(level => level && level.id && level.id !== '')
			this.noIsbnSelectedCategoryId = validLevels.length > 0 ? validLevels[validLevels.length - 1].id : ''
		},

		// 加载图书分类（从API）
		loadNoIsbnCategory() {
			this.noIsbnCategoryLoading = true
			const cookies = uni.getStorageSync('cookies') || this.kongfzToken || ''
			uni.request({
				url: 'https://api.buzhiyushu.cn/api/kongfz/getCategory',
				method: 'GET',
				data: { token: cookies },
				header: { 'Content-Type': 'application/json' },
				success: (res) => {
					const responseData = res.data
					if (responseData && responseData.successResponse) {
						this.noIsbnCategoryData = responseData.successResponse
						this.initNoIsbnCategoryPicker()
					} else {
						console.error('获取分类数据失败:', responseData)
						// 使用本地默认分类
						this.loadDefaultNoIsbnCategory()
					}
				},
				fail: (err) => {
					console.error('获取分类数据异常:', err)
					this.loadDefaultNoIsbnCategory()
				},
				complete: () => {
					this.noIsbnCategoryLoading = false
				}
			})
		},

		loadDefaultNoIsbnCategory() {
			const defaultCategories = [
				{ name: '文学', id: '1', level: 1, children: [{ name: '中国文学', id: '11', level: 2, children: [] }] },
				{ name: '艺术', id: '2', level: 1, children: [] },
				{ name: '历史', id: '3', level: 1, children: [] },
				{ name: '哲学', id: '4', level: 1, children: [] },
				{ name: '科学', id: '5', level: 1, children: [] },
				{ name: '技术', id: '6', level: 1, children: [] },
				{ name: '教育', id: '7', level: 1, children: [] },
				{ name: '经济', id: '8', level: 1, children: [] },
				{ name: '政治', id: '9', level: 1, children: [] },
				{ name: '军事', id: '10', level: 1, children: [] },
				{ name: '法律', id: '11', level: 1, children: [] },
				{ name: '社会', id: '12', level: 1, children: [] },
				{ name: '文化', id: '13', level: 1, children: [] },
				{ name: '语言', id: '14', level: 1, children: [] },
				{ name: '工具书', id: '15', level: 1, children: [] },
				{ name: '其他', id: '16', level: 1, children: [] }
			]
			this.noIsbnCategoryData = defaultCategories
			this.initNoIsbnCategoryPicker()
		},

		initNoIsbnCategoryPicker() {
			this.noIsbnCategoryColumns = []
			this.noIsbnCategoryLevels = []
			this.noIsbnCategoryIndexes = []
			const level1Categories = (this.noIsbnCategoryData || []).filter(item => item.level === 1)
			if (level1Categories.length === 0) return
			this.noIsbnCategoryColumns[0] = level1Categories
			this.noIsbnCategoryIndexes[0] = 0
			let currentParent = level1Categories[0]
			let currentLevel = 1
			this.noIsbnCategoryLevels[0] = currentParent
			while (currentLevel < this.noIsbnMaxCategoryLevel) {
				const children = currentParent.children || []
				if (children.length === 0) break
				this.noIsbnCategoryColumns[currentLevel] = children
				this.noIsbnCategoryIndexes[currentLevel] = 0
				this.noIsbnCategoryLevels[currentLevel] = children[0]
				currentParent = children[0]
				currentLevel++
			}
			while (this.noIsbnCategoryColumns.length < this.noIsbnMaxCategoryLevel) {
				this.noIsbnCategoryColumns.push([{ name: '暂无数据', id: '' }])
				this.noIsbnCategoryIndexes.push(0)
				this.noIsbnCategoryLevels.push({ name: '暂无数据', id: '' })
			}
			this.updateNoIsbnCategoryPathText()
			this.updateNoIsbnSelectedCategoryId()
		},

		// 印刷时间 - 列变化
		onNoIsbnPrintTimeColumnChange(e) {
			const { column, value } = e.detail
			this.noIsbnPrintTimeIndexes[column] = value
		},

		// 印刷时间 - 确认选择
		onNoIsbnPrintTimeChange(e) {
			const values = e.detail.value
			this.noIsbnPrintTimeIndexes = [...values]
			const year = this.noIsbnYearOptions[values[0]]
			const month = this.noIsbnMonthOptions[values[1]]
			if (year && month) {
				this.noIsbnPrintTime = year + '/' + month
			}
		},

		// 同步印刷时间选择器索引（空→今年，有值→对应年/月）
		syncNoIsbnPrintTimeIndexes() {
			if (this.noIsbnPrintTime) {
				const parts = this.noIsbnPrintTime.split('/')
				const yearIdx = this.noIsbnYearOptions.indexOf(parts[0])
				const monthIdx = parts[1] ? this.noIsbnMonthOptions.indexOf(parts[1].padStart(2, '0')) : -1
				if (yearIdx >= 0) this.noIsbnPrintTimeIndexes[0] = yearIdx
				if (monthIdx >= 0) this.noIsbnPrintTimeIndexes[1] = monthIdx
			} else {
				const curYear = String(new Date().getFullYear())
				const curYearIdx = this.noIsbnYearOptions.indexOf(curYear)
				if (curYearIdx >= 0) this.noIsbnPrintTimeIndexes[0] = curYearIdx
				this.noIsbnPrintTimeIndexes[1] = 0
			}
		},

		// 商品预览
		previewProductImage(index) {
			const urls = this.productList.map(item => item.image).filter(Boolean)
			if (urls.length > 0) {
				uni.previewImage({ urls, current: index })
			}
		},

		// 提交上传
		async submitUpload() {
			if (this.isSubmitting) return

			const warehouseData = this.currentTab === 'isbn' ? this.isbnWarehouseData : this.noIsbnWarehouseData
			if (!warehouseData) {
				uni.showToast({ title: '请选择货区', icon: 'none' })
				return
			}

			// 检查是否有图片
			if (this.currentTab === 'isbn' && this.photoList.length < 1) {
				uni.showToast({ title: '请至少拍一张图片', icon: 'none' })
				return
			}
			if (this.currentTab === 'no-isbn' && this.noIsbnPhotoList.length < 1) {
				uni.showToast({ title: '请至少拍一张图片', icon: 'none' })
				return
			}

			// 校验必填字段
			if (this.currentTab === 'isbn') {
				if (!this.isbn) {
					uni.showToast({ title: 'ISBN不能为空', icon: 'none' })
					return
				}
				if (!this.price) {
					uni.showToast({ title: '售价不能为空', icon: 'none' })
					return
				}
			} else {
				if (!this.noIsbnPrice) {
					uni.showToast({ title: '售价不能为空', icon: 'none' })
					return
				}
				if (!this.noIsbnBookName) {
					uni.showToast({ title: '书名不能为空', icon: 'none' })
					return
				}
			}

			// 先上传图片到MinIO，拿到URL
			this.isSubmitting = true
			uni.showLoading({ title: '上传图片中...', mask: true })
			try {
				const photoList = this.currentTab === 'isbn' ? this.photoList : this.noIsbnPhotoList
				const typeDir = this.currentTab === 'isbn' ? (this.isbn || 'UnknownIsbn') : this.noIsbnIsbn || this.noIsbnUnifyIsbn || 'NoIsbn'
				const imageUrls = await uploadImages(photoList, typeDir)

				console.log('【上传】MinIO图片URL列表:', imageUrls)

				// 图片上传完成后直接推送数据到接口
				if (this.currentTab === 'isbn') {
					await this.doSubmit(warehouseData, imageUrls)
				} else {
					await this.doNoIsbnSyncBook(imageUrls)
				}
			} catch (e) {
				uni.hideLoading()
				this.isSubmitting = false
				console.error('【上传】失败:', e)
				uni.showToast({ title: e.message || '上传失败', icon: 'none', duration: 3000 })
			}
		},

		async doSubmit(warehouseData, imageUrls) {
			this.isSubmitting = true
			uni.showLoading({ title: '上传中...', mask: true })
			try {
				console.log('【上传】MinIO图片URL列表:', imageUrls)

				// 品相纯数字
				const conditionDisplay = (this.currentTab === 'isbn' ? this.conditionValue : this.noIsbnConditionValue).replace('~', '')

				// 构建 form-data 参数
				const userId = uni.getStorageSync('aboutId') || ''
				const apiData = {
					user_id: userId,
					warehouse_id: String(warehouseData.warehouseId || ''),
					location_id: String(warehouseData.locationId || ''),
					isbn: '',
					price: '',
					stock: '',
					appearance: conditionDisplay,
					product_name: '',
					photos: imageUrls
				}

				if (this.currentTab === 'isbn') {
					apiData.isbn = this.isbn || ''
					apiData.price = this.price ? String(Math.round(parseFloat(this.price) * 100)) : ''
					apiData.stock = String(this.stock ?? '')
					apiData.product_name = this.bookName || ''
				} else {
					apiData.isbn = this.noIsbnIsbn || this.noIsbnUnifyIsbn || ''
					apiData.price = this.noIsbnPrice ? String(Math.round(parseFloat(this.noIsbnPrice) * 100)) : ''
					apiData.stock = String(this.noIsbnStock ?? '')
					apiData.product_name = this.noIsbnBookName || ''
				}

				// 调用 API 推送到店铺
				const apiUrl = 'https://psi.api.buzhiyushu.cn/api/product/pushToShop'
				const token = uni.getStorageSync('token') || ''
				console.log('【上传】推送API:', apiUrl, apiData)

				// 使用 uni.request 以 form-urlencoded 方式发送
				const res = await new Promise(function (resolve, reject) {
					uni.request({
						url: apiUrl,
						method: 'POST',
						header: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Authorization': 'Bearer ' + token
						},
						data: {
							user_id: apiData.user_id,
							warehouse_id: apiData.warehouse_id,
							location_id: apiData.location_id,
							isbn: apiData.isbn,
							price: apiData.price,
							stock: apiData.stock,
							appearance: apiData.appearance,
							product_name: apiData.product_name,
							photos: apiData.photos.join(',')
						},
						success: function (r) { resolve(r) },
						fail: function (e) { reject(e) }
					})
				})

				console.log('【上传】API响应:', res.statusCode, res.data)

				uni.hideLoading()

				if (res.statusCode !== 200) {
					throw new Error('API返回: HTTP ' + res.statusCode)
				}

				// 解析 JSON 响应
				var respData = res.data
				if (typeof respData === 'string') {
					try { respData = JSON.parse(respData) } catch (e) { respData = { code: 500, msg: respData } }
				}

				if (respData && respData.code === 200) {
 					uni.showToast({ title: respData.msg || '上传成功', icon: 'success' })
				} else {
					throw new Error(respData && respData.msg || '上传失败')
				}

				// pushToShop 成功后，调用 releaseGoodsAuto API
				var pushData = respData.data || {}
				var goodsUserId = uni.getStorageSync('aboutId') || ''
				var goodsWarehouseId = pushData.warehouse_id
				var goodsProductId = pushData.product_id
				if (goodsUserId && goodsWarehouseId && goodsProductId) {
					console.log('【上传】调用releaseGoodsAuto:', goodsUserId, goodsWarehouseId, goodsProductId)
					var releaseUrl = 'https://api.buzhiyushu.cn/zhishu/product/releaseGoodsAuto'
					// 手动构建 multipart/form-data 正文（兼容 App 环境，FormData 不可用）
					var boundary = '----Boundary' + Math.random().toString(36).slice(2)
					var bodyArr = []
					var appendField = function(name, val) {
						bodyArr.push('--' + boundary)
						bodyArr.push('Content-Disposition: form-data; name="' + name + '"')
						bodyArr.push('')
						bodyArr.push(String(val))
					}
					appendField('userId', goodsUserId)
					appendField('warehouseId', goodsWarehouseId)
					appendField('productId', goodsProductId)
					bodyArr.push('--' + boundary + '--')
					var formBody = bodyArr.join('\r\n')
					console.log('【上传】releaseGoodsAuto请求地址:', releaseUrl)
					console.log('【上传】releaseGoodsAuto请求参数:', { userId: String(goodsUserId), warehouseId: String(goodsWarehouseId), productId: String(goodsProductId) })
					uni.request({
						url: releaseUrl,
						method: 'POST',
						header: {
							'Content-Type': 'multipart/form-data; boundary=' + boundary,
							'Authorization': 'Basic ZWxhc3RpYzo1bVJESVVnNTJWQzBmcDE0bnctRg=='
						},
						data: formBody,
						success: function (r2) {
							console.log('【上传】releaseGoodsAuto响应:', r2.statusCode, r2.data)
						},
						fail: function (e2) {
							console.warn('【上传】releaseGoodsAuto失败:', JSON.stringify(e2))
						}
					})
				} else {
					console.warn('【上传】pushToShop返回缺少data字段,跳过releaseGoodsAuto')
				}

				// 保存上传记录到本地
				const uploadHistory = uni.getStorageSync('uploadHistory') || []
				uploadHistory.unshift({
					id: Date.now(),
					time: new Date().toLocaleString(),
					type: this.currentTab,
					apiUrl: apiUrl,
					apiResponse: res.data,
					data: apiData
				})
				uni.setStorageSync('uploadHistory', uploadHistory.slice(0, 100))

				// 清空表单
				if (this.currentTab === 'isbn') {
					this.photoList = []
					this.isbn = ''
					this.bookName = ''
					this.price = ''
					this.stock = 1
					this.author = ''
					this.publisher = ''
					this.fixPrice = ''
					this.printTime = ''
					this.productList = []
				} else {
					this.noIsbnPhotoList = []
					this.noIsbnBookName = ''
					this.noIsbnPrice = ''
					this.noIsbnStock = 1
					this.noIsbnAuthor = ''
					this.noIsbnPublisher = ''
					this.noIsbnOriginalPrice = ''
					this.noIsbnIsbn = ''
					this.noIsbnUnifyIsbn = ''
					this.noIsbnPrintTime = ''
					this.noIsbnFormat = ''
					this.noIsbnBinding = ''
					this.noIsbnProductList = []
				}
			} catch (e) {
				uni.hideLoading()
				console.error('【上传】失败:', e)
				uni.showToast({ title: '上传失败: ' + (e.message || '未知错误'), icon: 'none', duration: 3000 })
			} finally {
				this.isSubmitting = false
			}
		},

		// 无ISBN - 调用 syncBook 同步图书数据
		async doNoIsbnSyncBook(imageUrls) {
			this.isSubmitting = true
			uni.showLoading({ title: '上传中...', mask: true })
			try {
				const token = uni.getStorageSync('token') || ''

				// 构建参数（用于计算签名）
				var timestamp = String(Math.floor(Date.now() / 1000))

				// 出版时间转时间戳（1970-01-01 为 0）
				var pubTimeStr = this.noIsbnPrintTime || ''
				var pubTimestamp = '0'
				if (pubTimeStr) {
					var parts = pubTimeStr.split('-')
					if (parts.length >= 2) {
						var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1)
						var ts = Math.floor(d.getTime() / 1000)
						if (ts >= 0) { pubTimestamp = String(ts) }
					}
				}

				const params = {
					app_key: 'psi',
					client_id: 'psi',
					fid: '0',
					type: '4',
					isbn: this.noIsbnIsbn || this.noIsbnUnifyIsbn || '',
					f_isbn: '0',
					book_name: this.noIsbnBookName || '',
					f_book_name: '',
					author: this.noIsbnAuthor || '',
					publisher: this.noIsbnPublisher || '',
					publication_time: pubTimestamp,
					binding_layout: this.noIsbnBinding || '',
					fix_price: this.noIsbnPrice ? String(Math.round(parseFloat(this.noIsbnPrice) * 100)) : '',
					page_count: '0',
					word_count: this.noIsbnWordCount || '',
					book_format: '',
					'live_image[]': imageUrls.join(','),
					cai_id: JSON.stringify({
						xian_yu_cat_id: '',
						kong_fu_zi_cat_id: (this.noIsbnCategoryPathText || '').replace(/ \/ /g, '/'),
						pin_duo_duo_cat_id: ''
					}),
					timestamp: timestamp,
					sign_method: 'md5'
				}

				// 计算签名（与仓库列表一致的签名算法）
				var sign = calculateSign(params)
				params.sign = sign

				const apiUrl = 'https://psi.api.buzhiyushu.cn/api/syncBook'
				console.log('【syncBook】请求地址:', apiUrl)
				console.log('【syncBook】请求参数:', params)

				const res = await new Promise(function (resolve, reject) {
					uni.request({
						url: apiUrl,
						method: 'POST',
						header: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Authorization': 'Bearer ' + token
						},
						data: params,
						success: function (r) { resolve(r) },
						fail: function (e) { reject(e) }
					})
				})

				console.log('【syncBook】返回值:', res.statusCode, res.data)

				uni.hideLoading()

				if (res.statusCode !== 200) {
					throw new Error('API返回: HTTP ' + res.statusCode)
				}

				var respData = res.data
				if (typeof respData === 'string') {
					try { respData = JSON.parse(respData) } catch (e) { respData = { code: 500, msg: respData } }
				}

				if (respData && respData.code === 200) {
 					uni.showToast({ title: respData.msg || '上传成功', icon: 'success' })
				} else {
					throw new Error(respData && respData.msg || '上传失败')
				}

				// syncBook 成功后调用 pushToShop 推送到店铺
				try {
					const warehouseData = this.noIsbnWarehouseData
					const conditionDisplay = this.noIsbnConditionValue.replace('~', '')
					const userId = uni.getStorageSync('aboutId') || ''
					const tokenPush = uni.getStorageSync('token') || ''
					const pushUrl = 'https://psi.api.buzhiyushu.cn/api/product/pushToShop'
					const pushData = {
						user_id: userId,
						warehouse_id: String(warehouseData.warehouseId || ''),
						location_id: String(warehouseData.locationId || ''),
						isbn: (respData.data && (respData.data.isbn || '')) || this.noIsbnIsbn || this.noIsbnUnifyIsbn || '',
						price: this.noIsbnPrice ? String(Math.round(parseFloat(this.noIsbnPrice) * 100)) : '',
						stock: String(this.noIsbnStock ?? ''),
						appearance: conditionDisplay,
						product_name: this.noIsbnBookName || '',
						photos: imageUrls.join(',')
					}
					console.log('【syncBook】pushToShop请求地址:', pushUrl)
					console.log('【syncBook】pushToShop请求参数:', pushData)
					const pushRes = await new Promise(function (resolve, reject) {
						uni.request({
							url: pushUrl,
							method: 'POST',
							header: {
								'Content-Type': 'application/x-www-form-urlencoded',
								'Authorization': 'Bearer ' + tokenPush
							},
							data: pushData,
							success: function (r) { resolve(r) },
							fail: function (e) { reject(e) }
						})
					})
					console.log('【syncBook】pushToShop返回值:', pushRes.statusCode, pushRes.data)

					// pushToShop 成功后，调用 releaseGoodsAuto API
					if (pushRes.statusCode === 200) {
						var pushRespData = pushRes.data
						if (typeof pushRespData === 'string') {
							try { pushRespData = JSON.parse(pushRespData) } catch (e) { pushRespData = {} }
						}
						if (pushRespData && pushRespData.code === 200) {
							var pushRespInner = pushRespData.data || {}
							var goodsUserId2 = uni.getStorageSync('aboutId') || ''
							var goodsWarehouseId2 = pushRespInner.warehouse_id
							var goodsProductId2 = pushRespInner.product_id
							if (goodsUserId2 && goodsWarehouseId2 && goodsProductId2) {
								console.log('【syncBook】调用releaseGoodsAuto:', goodsUserId2, goodsWarehouseId2, goodsProductId2)
								var releaseUrl2 = 'https://api.buzhiyushu.cn/zhishu/product/releaseGoodsAuto'
								var boundary2 = '----Boundary' + Math.random().toString(36).slice(2)
								var bodyArr2 = []
								var appendField2 = function(name, val) {
									bodyArr2.push('--' + boundary2)
									bodyArr2.push('Content-Disposition: form-data; name="' + name + '"')
									bodyArr2.push('')
									bodyArr2.push(String(val))
								}
								appendField2('userId', goodsUserId2)
								appendField2('warehouseId', goodsWarehouseId2)
								appendField2('productId', goodsProductId2)
								bodyArr2.push('--' + boundary2 + '--')
								var formBody2 = bodyArr2.join('\r\n')
								console.log('【syncBook】releaseGoodsAuto请求地址:', releaseUrl2)
								console.log('【syncBook】releaseGoodsAuto请求参数:', { userId: String(goodsUserId2), warehouseId: String(goodsWarehouseId2), productId: String(goodsProductId2) })
								uni.request({
									url: releaseUrl2,
									method: 'POST',
									header: {
										'Content-Type': 'multipart/form-data; boundary=' + boundary2,
										'Authorization': 'Basic ZWxhc3RpYzo1bVJESVVnNTJWQzBmcDE0bnctRg=='
									},
									data: formBody2,
									success: function (r3) {
										console.log('【syncBook】releaseGoodsAuto响应:', r3.statusCode, r3.data)
									},
									fail: function (e3) {
										console.warn('【syncBook】releaseGoodsAuto失败:', JSON.stringify(e3))
									}
								})
							} else {
								console.warn('【syncBook】pushToShop返回缺少warehouse_id/product_id,跳过releaseGoodsAuto')
							}
						} else if (pushRespData && pushRespData.msg) {
							// code 非 200，显示错误信息
							uni.showToast({ title: pushRespData.msg, icon: 'none', duration: 3000 })
						}
					} else {
						// HTTP 非 200
						var errMsg = 'pushToShop请求失败: HTTP ' + pushRes.statusCode
						console.error('【syncBook】' + errMsg)
						uni.showToast({ title: errMsg, icon: 'none', duration: 3000 })
					}
				} catch (ePush) {
					console.warn('【syncBook】pushToShop失败:', ePush)
				}

				// 保存上传记录到本地
				const uploadHistory = uni.getStorageSync('uploadHistory') || []
				uploadHistory.unshift({
					id: Date.now(),
					time: new Date().toLocaleString(),
					type: this.currentTab,
					apiUrl: apiUrl,
					apiResponse: res.data,
					data: params
				})
				uni.setStorageSync('uploadHistory', uploadHistory.slice(0, 100))

				// 清空表单
				this.noIsbnPhotoList = []
				this.noIsbnBookName = ''
				this.noIsbnPrice = ''
				this.noIsbnStock = 1
				this.noIsbnAuthor = ''
				this.noIsbnPublisher = ''
				this.noIsbnOriginalPrice = ''
				this.noIsbnIsbn = ''
				this.noIsbnUnifyIsbn = ''
				this.noIsbnPrintTime = ''
				this.noIsbnFormat = ''
				this.noIsbnBinding = ''
				this.noIsbnProductList = []
			} catch (e) {
				uni.hideLoading()
				console.error('【syncBook】失败:', e)
				uni.showToast({ title: e.message || '上传失败', icon: 'none', duration: 3000 })
			} finally {
				this.isSubmitting = false
			}
		},

		// 无ISBN - 书名搜索（使用与ISBN相同的kongfz接口）
		searchNoIsbn() {
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录孔网账号', icon: 'none' })
				return
			}
			if (!this.noIsbnBookName) {
				uni.showToast({ title: '请输入书名', icon: 'none' })
				return
			}
			// 先查询PSI系统已有图书
			this.searchNoIsbnBook(function(hasData) {
				if (!hasData) {
					// 无匹配数据，走孔网搜索
					this.searchNoIsbnKongfz()
				}
			}.bind(this))
		},

		// 无ISBN - 查询PSI系统已有图书（getNoIsbnBook），有数据则弹窗选择
		searchNoIsbnBook(callback) {
			var ts = String(Math.floor(Date.now() / 1000))
			var token = uni.getStorageSync('token') || ''
			var params = {
				app_key: 'psi',
				client_id: 'psi',
				timestamp: ts,
				sign_method: 'md5',
				book_name: this.noIsbnBookName || '',
				author: this.noIsbnAuthor || '',
				publisher: this.noIsbnPublisher || ''
			}
			var sign = calculateSign(params)

			var q = []
			q.push('app_key=' + encodeURIComponent(params.app_key))
			q.push('client_id=' + encodeURIComponent(params.client_id))
			q.push('timestamp=' + encodeURIComponent(params.timestamp))
			q.push('sign_method=' + encodeURIComponent(params.sign_method))
			q.push('book_name=' + encodeURIComponent(params.book_name))
			q.push('author=' + encodeURIComponent(params.author))
			q.push('publisher=' + encodeURIComponent(params.publisher))
			q.push('sign=' + encodeURIComponent(sign))
			var url = 'https://psi.api.buzhiyushu.cn/api/getNoIsbnBook?' + q.join('&')

			console.log('【getNoIsbnBook】请求URL:', url)

			var that = this
			uni.request({
				url: url,
				method: 'GET',
				header: {
					'Authorization': 'Bearer ' + token
				},
				success: function(res) {
					console.log('【getNoIsbnBook】响应:', res.statusCode, res.data)
					if (res.statusCode === 200 && res.data && res.data.code === 200) {
						var list = (res.data.data && res.data.data.list) || []
						if (list.length > 0) {
							// 使用自定义弹窗
							that.noIsbnBookList = list
							that.noIsbnBookPopupVisible = true
							return
						}
						// code=200但无数据，走回调（进入孔网搜索）
						if (typeof callback === 'function') callback.call(that, false)
					} else {
						// 非200或code≠200，显示错误，不执行下一步
						var errMsg = ''
						if (res.data) {
							errMsg = res.data.msg || res.data.message || ('请求失败: ' + res.statusCode)
						} else {
							errMsg = '请求失败: HTTP ' + res.statusCode
						}
						console.error('【getNoIsbnBook】错误:', errMsg)
						uni.showToast({ title: errMsg, icon: 'none', duration: 3000 })
						if (typeof callback === 'function') callback.call(that, true)
					}
				},
				fail: function(err) {
					console.error('【getNoIsbnBook】网络请求失败:', JSON.stringify(err))
					uni.showToast({ title: '网络请求失败', icon: 'none', duration: 3000 })
					if (typeof callback === 'function') callback.call(that, true)
				}
			})
		},

		// 无ISBN已有图书弹窗 - 关闭（取消选择，走孔夫子搜索）
		closeNoIsbnBookPopup() {
			this.noIsbnBookPopupVisible = false
			this.noIsbnBookList = []
			// 取消选择，用表单数据走孔夫子搜索
			this.searchNoIsbnKongfz()
		},
		// 无ISBN已有图书弹窗 - 选中一项
		selectNoIsbnBookItem(selected) {
			if (selected.book_name) this.noIsbnBookName = selected.book_name
			if (selected.author) this.noIsbnAuthor = selected.author
			if (selected.publishing) this.noIsbnPublisher = selected.publishing
			if (selected.isbn) {
				this.noIsbnIsbn = selected.isbn
				this.noIsbnUnifyIsbn = ''
			}
			if (selected.publication_time && Number(selected.publication_time) > 0) {
				var d = new Date(Number(selected.publication_time) * 1000)
				this.noIsbnPrintTime = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
			}
			if (selected.words_count) this.noIsbnWordCount = String(selected.words_count)
			if (selected.price) this.noIsbnOriginalPrice = String(selected.price)
			if (selected.binding) this.noIsbnBinding = selected.binding
			uni.showToast({ title: '已选择: ' + (selected.book_name || ''), icon: 'success' })
			this.closeNoIsbnBookPopup()
			// 选择后继续走孔夫子搜索流程
			this.searchNoIsbnKongfz()
		},

		// 无ISBN - 孔夫子搜索（原searchNoIsbn逻辑）
		searchNoIsbnKongfz() {
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录孔网账号', icon: 'none' })
				return
			}
			if (!this.noIsbnBookName) {
				uni.showToast({ title: '请输入书名', icon: 'none' })
				return
			}
			this.noIsbnLoading = true
			this.noIsbnProductList = []
			const phpsessid = this.kongfzToken || uni.getStorageSync('kongfz_phpsessid') || ''
			const keyword = this.noIsbnBookName
			Promise.all([
				searchProducts(keyword, { phpsessid, sortType: '7', quality: this.noIsbnConditionValue }),
				searchFacet(keyword, { phpsessid, dataType: 0 }),
				searchFacet(keyword, { phpsessid, dataType: 1 })
			]).then(([productsData, onSaleFacet, soldFacet]) => {
				this.noIsbnLoading = false
				// 收集作者和出版社选项
				const authorSet = new Set()
				const publisherSet = new Set()
				if (productsData && productsData.total > 0) {
					const list = (productsData.list || []).slice(0, 12)
					this.noIsbnProductList = list.map(item => {
						const cleanPrice = parseFloat((item.priceText || '0').replace(/[^\d.]/g, ''))
						let shippingFee = 0
						if (item.postage) {
							if (typeof item.postage === 'number' || typeof item.postage === 'string') {
								shippingFee = parseFloat(item.postage) || 0
							} else if (item.postage.shippingList && item.postage.shippingList.length > 0) {
								shippingFee = parseFloat(item.postage.shippingList[0].shippingFee || 0)
							} else if (item.postage.shippingFee) {
								shippingFee = parseFloat(item.postage.shippingFee || 0)
							}
						}
						if (shippingFee === 0 && item.shippingFee) {
							shippingFee = parseFloat(item.shippingFee) || 0
						}
						const totalPrice = Number((cleanPrice + shippingFee).toFixed(2))
						// 提取作者和出版社
						if (item.author) authorSet.add(item.author.trim())
						if (item.shopName) publisherSet.add(item.shopName.trim())
						return {
							image: item.imgBigUrl || '',
							totalPrice: totalPrice,
							bookPrice: cleanPrice,
							shippingFee: shippingFee,
							condition: item.qualityText || '',
							shopName: item.shopName || '',
							bookName: item.title || '',
							author: item.author || '',
							press: item.press || '',
							pubDate: item.pubDateText || '',
							bookId: item.id || ''
						}
					})
				}
				// 市场统计
				this.noIsbnMarketData = {
					onSale: onSaleFacet ? onSaleFacet.totalFound : (productsData ? productsData.total : 0),
					old: onSaleFacet ? onSaleFacet.oldCount : 0,
					new: onSaleFacet ? onSaleFacet.newCount : 0,
					sold: soldFacet ? (soldFacet.oldCount + soldFacet.newCount) : 0
				}
				// 填充下拉选项
				this.noIsbnAuthorOptions = Array.from(authorSet).filter(Boolean).slice(0, 10)
				this.noIsbnPublisherOptions = Array.from(publisherSet).filter(Boolean).slice(0, 10)
				// 自动计算并填入售价
				this.$nextTick(() => {
					if (this.calculatedNoIsbnPrice > 0) {
						this.noIsbnPrice = String(this.calculatedNoIsbnPrice)
					}
				})
			}).catch(err => {
				console.error('无ISBN搜索失败:', err)
				this.noIsbnLoading = false
				this.noIsbnMarketData = { onSale: 0, old: 0, new: 0, sold: 0 }
				uni.showToast({ title: '查询失败', icon: 'none' })
			})
		},

		// 无ISBN - 版权页比价（带作者+出版社精确搜索）
		searchNoIsbnCopyright() {
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录孔网账号', icon: 'none' })
				return
			}
			if (!this.noIsbnBookName) {
				uni.showToast({ title: '请输入书名', icon: 'none' })
				return
			}
			this.noIsbnLoading = true
			this.noIsbnProductList = []
			const phpsessid = this.kongfzToken || uni.getStorageSync('kongfz_phpsessid') || ''
			const keyword = this.noIsbnBookName
			searchProducts(keyword, {
				phpsessid,
				sortType: '7',
				quality: this.noIsbnConditionValue,
				publisher: this.noIsbnPublisher,
				author: this.noIsbnAuthor
			}).then((productsData) => {
				this.noIsbnLoading = false
				if (productsData && productsData.total > 0) {
					const list = (productsData.list || []).slice(0, 12)
					this.noIsbnProductList = list.map(item => {
						const cleanPrice = parseFloat((item.priceText || '0').replace(/[^\d.]/g, ''))
						let shippingFee = 0
						if (item.postage) {
							if (typeof item.postage === 'number' || typeof item.postage === 'string') {
								shippingFee = parseFloat(item.postage) || 0
							} else if (item.postage.shippingList && item.postage.shippingList.length > 0) {
								shippingFee = parseFloat(item.postage.shippingList[0].shippingFee || 0)
							} else if (item.postage.shippingFee) {
								shippingFee = parseFloat(item.postage.shippingFee || 0)
							}
						}
						if (shippingFee === 0 && item.shippingFee) {
							shippingFee = parseFloat(item.shippingFee) || 0
						}
						const totalPrice = Number((cleanPrice + shippingFee).toFixed(2))
						return {
							image: item.imgBigUrl || '',
							totalPrice: totalPrice,
							bookPrice: cleanPrice,
							shippingFee: shippingFee,
							condition: item.qualityText || '',
							shopName: item.shopName || '',
							bookName: item.title || '',
							author: item.author || '',
							press: item.press || '',
							pubDate: item.pubDateText || '',
							bookId: item.id || ''
						}
					})
					// 自动计算并填入售价
					this.$nextTick(() => {
						if (this.calculatedNoIsbnPrice > 0) {
							this.noIsbnPrice = String(this.calculatedNoIsbnPrice)
						}
					})
				}
			}).catch(err => {
				console.error('版权比价失败:', err)
				this.noIsbnLoading = false
				uni.showToast({ title: '比价失败', icon: 'none' })
			})
		},

		// 无ISBN - 识图上传（拍照→OCR识别→自动填写表单）
		chooseImageNoIsbn() {
			uni.showToast({ title: '请选择图书封面', icon: 'none' })
			uni.chooseImage({
				count: 1,
				sizeType: ['original', 'compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePaths = res.tempFilePaths
					if (!tempFilePaths || tempFilePaths.length === 0) return
					const filePath = tempFilePaths[0]
					uni.showLoading({ title: '识别中...', mask: true })
					// 压缩图片（大于500KB）
					this.compressNoIsbnImage(filePath).then(compressedPath => {
						this.ocrNoIsbnImage(compressedPath)
					})
				}
			})
		},

		// 压缩图片
		compressNoIsbnImage(filePath) {
			return new Promise((resolve) => {
				uni.getFileInfo({
					filePath: filePath,
					success: (info) => {
						if (info.size > 500 * 1024) {
							uni.compressImage({
								src: filePath,
								quality: 80,
								success: (res) => resolve(res.tempFilePath),
								fail: () => resolve(filePath)
							})
						} else {
							resolve(filePath)
						}
					},
					fail: () => resolve(filePath)
				})
			})
		},

		// OCR识别并填充表单
		ocrNoIsbnImage(filePath) {
			uni.uploadFile({
				url: 'https://book.xcx.ocr.buzhiyushu.cn/ocr',
				filePath: filePath,
				name: 'file',
				success: (res) => {
					uni.hideLoading()
					try {
						const ocrData = JSON.parse(res.data)
						if (ocrData && ocrData.texts) {
							const texts = ocrData.texts
							// 自动填充表单
							if (texts.书名) this.noIsbnBookName = texts.书名
							if (texts.作者) this.noIsbnAuthor = texts.作者
							if (texts.出版社) this.noIsbnPublisher = texts.出版社
							if (texts.出版时间) this.noIsbnPrintTime = texts.出版时间
							if (texts.定价) {
								this.noIsbnOriginalPrice = texts.定价.replace('元', '').trim()
							}
							if (texts.开本) {
								const fmt = String(texts.开本).replace('开', '').trim()
								this.noIsbnFormat = this.noIsbnFormatOptions.includes(fmt) ? fmt : fmt + '开'
							}
							if (texts.ISBN && /^\d/.test(texts.ISBN)) {
								this.noIsbnIsbn = texts.ISBN
								this.noIsbnUnifyIsbn = ''
							}
							if (texts.书号) {
								const bookCode = texts.书号.replace(/\D/g, '')
								if (bookCode.length === 13) {
									this.noIsbnIsbn = bookCode
								} else if (bookCode.length === 10 && /^\d{9}[\dXx]$/i.test(bookCode)) {
									this.noIsbnIsbn = this.convertIsbn10To13(bookCode)
								} else {
									this.noIsbnIsbn = '678' + String(Date.now()).slice(-10)
								}
								this.noIsbnUnifyIsbn = texts.书号
							}
							if (texts.字数) this.noIsbnWordCount = this.processNoIsbnWordage(texts.字数)

							uni.showToast({ title: '识别成功', icon: 'success' })

							// 有书名则先查PSI系统已有图书，无匹配时自动搜索孔网比价
							if (this.noIsbnBookName) {
								setTimeout(() => this.searchNoIsbn(), 500)
							}
						} else {
							uni.showToast({ title: '识别失败，未识别到图书信息', icon: 'none' })
						}
					} catch (e) {
						console.error('OCR解析失败:', e)
						uni.showToast({ title: '识别失败，请重试', icon: 'none' })
					}
				},
				fail: (err) => {
					uni.hideLoading()
					console.error('OCR请求失败:', err)
					uni.showToast({ title: '网络错误，请重试', icon: 'none' })
				}
			})
		},

		// 处理字数文本（如"300千字"→300000）
		processNoIsbnWordage(wordage) {
			if (!wordage) return ''
			if (typeof wordage === 'string' && wordage.includes('千字')) {
				const match = wordage.match(/(\d+(\.\d+)?)/)
				if (match && match[1]) {
					return Math.round(parseFloat(match[1]) * 1000).toString()
				}
			}
			return wordage.replace(/[^\d]/g, '')
		},

		// 无ISBN - 选择作者
		selectNoIsbnAuthor(item) {
			this.noIsbnAuthor = item
			this.noIsbnAuthorDropdownVisible = false
		},

		// 无ISBN - 选择出版社
		selectNoIsbnPublisher(item) {
			this.noIsbnPublisher = item
			this.noIsbnPublisherDropdownVisible = false
		},

		// 无ISBN - 选择开本
		selectNoIsbnFormat(item) {
			this.noIsbnFormat = item
			this.noIsbnFormatDropdownVisible = false
		},

		selectNoIsbnBinding(item) {
			this.noIsbnBinding = item
			this.noIsbnBindingDropdownVisible = false
		},

		// 登录 - 接入孔夫子真实登录
		handleLogin() {
			if (!this.loginAccount) {
				uni.showToast({ title: '请输入账号', icon: 'none' })
				return
			}
			if (!this.loginPassword) {
				uni.showToast({ title: '请输入密码', icon: 'none' })
				return
			}
			this.doLogin(this.loginAccount, this.loginPassword)
		},

		doLogin(username, password) {
			uni.showLoading({ title: '登录中...', mask: true })
			kongfzLogin(username, password).then(res => {
				uni.hideLoading()
				if (res.success) {
					this.kongfzToken = res.token
					this.isLoggedIn = true
					this.shopName = username
					this.shopRegion = '孔夫子旧书网'
					// 持久化登录状态
					uni.setStorageSync('kongfz_phpsessid', res.token)
					uni.setStorageSync('kongfz_shop_name', username)
					uni.setStorageSync('kongfz_shop_region', '孔夫子旧书网')
					if (this.rememberPassword) {
						uni.setStorageSync('kongfz_remembered_account', username)
					}
					// 保存到账号列表
					this.saveAccount(username, password)
					uni.showToast({ title: '登录成功', icon: 'success' })
				} else {
					uni.showToast({ title: res.message || '登录失败', icon: 'none' })
				}
			}).catch(err => {
				uni.hideLoading()
				uni.showToast({ title: '网络异常，请重试', icon: 'none' })
				console.error('登录异常:', err)
			})
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
						this.kongfzToken = ''
						uni.removeStorageSync('kongfz_phpsessid')
						uni.removeStorageSync('kongfz_shop_name')
						uni.removeStorageSync('kongfz_shop_region')
					}
				}
			})
		},

		// 加载已保存账号列表
		loadSavedAccounts() {
			try {
				const list = uni.getStorageSync('kongfz_saved_accounts')
				this.savedAccountList = list ? JSON.parse(list) : []
			} catch (e) {
				this.savedAccountList = []
			}
		},

		// 保存账号到列表
		saveAccount(username, password) {
			const accounts = [...this.savedAccountList]
			// 去重：如果已存在相同用户名，替换密码
			const idx = accounts.findIndex(a => a.username === username)
			if (idx >= 0) {
				accounts[idx].password = password
			} else {
				accounts.push({ username, password })
			}
			this.savedAccountList = accounts
			uni.setStorageSync('kongfz_saved_accounts', JSON.stringify(accounts))
		},

		// 点击已保存账号快速登录
		quickLogin(acc) {
			uni.showLoading({ title: '登录中...', mask: true })
			this.loginAccount = acc.username
			this.loginPassword = acc.password
			this.doLogin(acc.username, acc.password)
		},

		// 删除已保存账号
		deleteSavedAccount(idx) {
			uni.showModal({
				title: '提示',
				content: '确定要删除该账号吗？',
				success: (res) => {
					if (res.confirm) {
						this.savedAccountList.splice(idx, 1)
						uni.setStorageSync('kongfz_saved_accounts', JSON.stringify(this.savedAccountList))
					}
				}
			})
		},

		// 小数输入处理（保留两位小数）
		onDecimalInput(field, event) {
			let val = event.detail.value
			val = val.replace(/[^\d.]/g, '')
			const parts = val.split('.')
			if (parts.length > 2) {
				val = parts[0] + '.' + parts.slice(1).join('')
			}
			if (parts.length === 2 && parts[1].length > 2) {
				val = parts[0] + '.' + parts[1].substring(0, 2)
			}
			this[field] = val
		},

		// 加载定价策略配置
		loadPriceConfig() {
			try {
				const saved = uni.getStorageSync('price_config')
				if (saved) {
					const cfg = JSON.parse(saved)
					this.priceMode = cfg.priceMode || 'lowest'
					this.lowestRank = cfg.lowestRank || 1
					this.averageCount = cfg.averageCount || 2
					this.shippingFee = cfg.shippingFee || 0
					this.priceDiscount = cfg.priceDiscount || 0
					this.minBookPrice = cfg.minBookPrice || 0
				}
			} catch (e) {
				console.error('加载定价配置失败:', e)
			}
		},

		// 保存定价策略配置
		savePriceConfig() {
			const cfg = {
				priceMode: this.priceMode,
				lowestRank: Number(this.lowestRank) || 1,
				averageCount: Number(this.averageCount) || 2,
				shippingFee: Number(this.shippingFee) || 0,
				priceDiscount: Number(this.priceDiscount) || 0,
				minBookPrice: Number(this.minBookPrice) || 0
			}
			uni.setStorageSync('price_config', JSON.stringify(cfg))
			uni.showToast({ title: '设置已保存', icon: 'success' })
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

/* ========== 基本信息合并块（品相+货区+书名+价格） ========== */
.info-block {
  background-color: #ffffff;
  border-radius: 12rpx;
  border: 2rpx solid #ebeef5;
  padding: 20rpx 24rpx;
}

.info-block-row {
  padding: 4rpx 0;
}

.info-block-divider {
  height: 2rpx;
  background-color: #f2f3f5;
  margin: 6rpx 0;
}

/* 行内标签在前 */
.info-inline-row {
  display: flex;
  align-items: center;
  padding: 4rpx 0;
}

.info-inline-label {
  font-size: 26rpx;
  color: #606266;
  font-weight: 500;
  flex-shrink: 0;
  margin-right: 16rpx;
  white-space: nowrap;
}

.info-inline-input {
  flex: 1;
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
  color: #303133;
  box-sizing: border-box;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
}

.form-input:focus {
  border-color: #409eff;
}

/* 下拉内联框：右侧直角与▼按钮衔接 */
.dropdown-wrapper .form-input {
  border-radius: 8rpx 0 0 8rpx;
  border-right: none;
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

/* 印刷时间选择器：和表单输入框一致 */
.picker-value-text {
  display: flex;
  align-items: center;
}
uni-picker,
picker {
  display: block;
  width: 100%;
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
  align-items: center;
  gap: 16rpx;
}

.inline-field {
  flex: 1;
}

.inline-field.narrow {
  flex: none;
  width: 250rpx;
}

.inline-field.isbn-field {
  flex: 1;
  max-width: 80%;
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

/* ========== 版权页比价按钮 ========== */
.copyright-btn {
  margin-left: auto;
  padding: 8rpx 16rpx;
  background-color: #409eff;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copyright-btn-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 500;
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
  flex-wrap: nowrap;
  gap: 8rpx;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.condition-item {
  background-color: #f4f4f5;
  border: 2rpx solid #e9e9eb;
  border-radius: 6rpx;
  padding: 6rpx 16rpx;
  flex-shrink: 0;
}

.condition-item.active {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.condition-text {
  font-size: 20rpx;
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
  padding: 14rpx 6rpx;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #909399;
}

.stat-value {
  font-size: 28rpx;
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
  gap: 8rpx;
  margin-top: 10rpx;
}

.grid-item {
  background-color: #fafafa;
  border: 2rpx solid #ebeef5;
  border-radius: 8rpx;
  padding: 6rpx;
  overflow: hidden;
}

.grid-image {
  width: 100%;
  height: 120rpx;
  border-radius: 4rpx;
}

.grid-total-price {
  font-size: 20rpx;
  color: #f56c6c;
  font-weight: 600;
  display: block;
  text-align: center;
  margin-top: 2rpx;
  line-height: 1.4;
}

.grid-price-detail {
  font-size: 16rpx;
  color: #909399;
  display: block;
  text-align: center;
  line-height: 1.3;
}

.grid-book-name {
  font-size: 22rpx;
  color: #303133;
  font-weight: 500;
  display: block;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.grid-author {
  font-size: 18rpx;
  color: #909399;
  display: block;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.grid-condition {
  font-size: 20rpx;
  color: #606266;
  display: block;
  text-align: center;
  line-height: 1.3;
}

.grid-shop {
  font-size: 18rpx;
  color: #909399;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  line-height: 1.3;
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

/* ========== 折叠详情 ========== */
.detail-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  margin: 20rpx 0;
  background-color: #f5f7fa;
  border-radius: 8rpx;
}

.detail-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
}

.detail-arrow {
  font-size: 24rpx;
  color: #909399;
  transition: transform 0.2s;
}

/* ========== 下拉列表（作者/出版社/开本） ========== */
.dropdown-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.dropdown-btn {
  width: 60rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #909399;
  background-color: #f5f7fa;
  border: 2rpx solid #dcdfe6;
  border-left: none;
  border-radius: 0 8rpx 8rpx 0;
  flex-shrink: 0;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  max-height: 300rpx;
  overflow-y: auto;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.dropdown-item {
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #303133;
  border-bottom: 1rpx solid #f2f2f2;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background-color: #f5f7fa;
}

.submit-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
}

.submit-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
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
.wh-tabs-body {
  flex: 1;
  min-height: 0;
  overflow: hidden !important;
  max-height: none !important;
  display: flex;
  flex-direction: column;
}

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

/* ========== 仓库货位搜索栏 ========== */
.wh-search-bar {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-bottom: 2rpx solid #e4e7ed;
  padding: 8rpx 16rpx;
  position: relative;
}

.wh-search-input {
  flex: 1;
  background: #f0f2f5;
  border: none;
  border-radius: 8rpx;
  height: 56rpx;
  padding: 0 100rpx 0 16rpx;
  font-size: 26rpx;
  color: #303133;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.wh-search-input::placeholder {
  color: #c0c4cc;
}

.wh-search-clear {
  position: absolute;
  right: 72rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #c0c4cc;
  color: #ffffff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wh-scan-btn {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #606266;
}

/* ========== 仓库货位列表 ========== */
.wh-location-list {
  flex: 1;
  height: 0;
  min-height: 0;
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

/* ========== 扫码结果弹窗 ========== */
.scan-result-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.3);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-result-popup {
  width: 560rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
}

.popup-scan-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-scan-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.popup-scan-close {
  font-size: 36rpx;
  color: #999999;
  padding: 0 10rpx;
}

.popup-scan-content {
  padding: 30rpx;
  min-height: 120rpx;
}

.scan-result-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.scan-result-label {
  font-size: 28rpx;
  color: #666666;
  margin-right: 20rpx;
  min-width: 120rpx;
}

.scan-result-value {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.scan-result-hint {
  font-size: 26rpx;
  color: #999999;
  margin-top: 10rpx;
  display: block;
}

.popup-scan-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.popup-scan-btn {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 32rpx;
}

.popup-scan-cancel {
  background-color: #f5f5f5;
  color: #333333;
}

.popup-scan-confirm {
  background-color: #007aff;
  color: #ffffff;
}

/* ========== 定价策略 ========== */
.mode-tabs {
  display: flex;
  background: #f0f2f5;
  border-radius: 8rpx;
  padding: 4rpx;
  margin-bottom: 24rpx;
}

.mode-tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 6rpx;
  font-size: 26rpx;
  color: #606266;
  transition: all 0.2s;
}

.mode-tab.active {
  background: #ffffff;
  color: #409eff;
  font-weight: 600;
  box-shadow: 0 1rpx 4rpx rgba(0,0,0,0.06);
}

.mode-tab-text {
  font-size: 26rpx;
}

.config-field {
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f0f2f5;
}

.config-field:last-of-type {
  border-bottom: none;
  margin-bottom: 16rpx;
}

.config-label {
  display: block;
  font-size: 26rpx;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4rpx;
}

.config-desc {
  display: block;
  font-size: 22rpx;
  color: #909399;
  margin-bottom: 12rpx;
}

.picker-wrap {
  display: flex;
}

.picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 72rpx;
  min-width: 200rpx;
  box-sizing: border-box;
}

.picker-btn:active {
  border-color: #409eff;
}

.picker-btn-text {
  font-size: 28rpx;
  color: #303133;
}

.num-input-field {
  background: #ffffff;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  padding: 0 16rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: #303133;
  width: 100%;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.num-input-field:focus {
  border-color: #409eff;
  outline: none;
}

.num-input-field::placeholder {
  color: #c0c4cc;
}

.save-config-btn {
  background: #409eff;
  color: #ffffff;
  text-align: center;
  padding: 22rpx 0;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin-top: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(64,158,255,0.2);
}

.save-config-btn:active {
  opacity: 0.85;
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
  width: 100%;
  display: flex;
  align-items: center;
}

.password-input {
  flex: 1;
  padding-right: 90rpx !important;
  -webkit-appearance: none;
  appearance: none;
}

/* H5浏览器密码框默认眼睛图标隐藏 */
.password-input::-webkit-credentials-auto-fill-button,
.password-input::-webkit-reveal,
.password-input::-ms-reveal {
  display: none !important;
  -webkit-appearance: none;
  appearance: none;
}

/* H5密码框自动填充背景色覆盖 */
.password-input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000rpx #ffffff inset !important;
  -webkit-text-fill-color: #303133 !important;
}

.password-eye {
  position: absolute;
  right: 8rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
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

/* --- 已保存账号列表 --- */
.saved-accounts {
  margin-top: 28rpx;
  padding-top: 24rpx;
  border-top: 2rpx solid #ebeef5;
}

.saved-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.saved-title {
  font-size: 26rpx;
  color: #303133;
  font-weight: 600;
}

.saved-count {
  font-size: 22rpx;
  color: #909399;
}

.saved-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.saved-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 18rpx;
  background: #f7f8fa;
  border: 2rpx solid #ebeef5;
  border-radius: 10rpx;
}

.saved-item:active {
  background: #ecf5ff;
  border-color: #409eff;
}

.saved-item-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex: 1;
  min-width: 0;
}

.saved-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #ecf5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
}

.saved-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
  flex: 1;
}

.saved-name {
  font-size: 26rpx;
  color: #303133;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-hint {
  font-size: 22rpx;
  color: #909399;
}

.saved-del {
  font-size: 24rpx;
  color: #f56c6c;
  padding: 6rpx 10rpx;
  flex-shrink: 0;
}

.saved-del:active {
  opacity: 0.7;
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

/* 无ISBN已有图书弹窗 */
.noisbn-book-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}
.noisbn-book-popup {
  background: #fff;
  border-radius: 20rpx;
  width: 85%;
  max-width: 650rpx;
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.noisbn-book-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #f0f0f0;
}
.noisbn-book-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.noisbn-book-close {
  font-size: 36rpx;
  color: #999;
  padding: 8rpx;
}
.noisbn-book-scroll {
  max-height: 60vh;
  height: 600rpx;
  padding: 0 20rpx;
}
.noisbn-book-item {
  display: flex;
  align-items: center;
  padding: 24rpx 16rpx;
  border-bottom: 1rpx solid #f5f5f5;
  cursor: pointer;
}
.noisbn-book-item:active {
  background: #f5f7fa;
}
.noisbn-book-item-num {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  font-size: 22rpx;
  text-align: center;
  line-height: 48rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.noisbn-book-item-body {
  flex: 1;
  min-width: 0;
}
.noisbn-book-item-name {
  font-size: 28rpx;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.noisbn-book-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}
.meta-tag {
  font-size: 22rpx;
  color: #909399;
  background: #f5f7fa;
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
  white-space: nowrap;
}
.noisbn-book-item-arrow {
  color: #c0c4cc;
  font-size: 32rpx;
  margin-left: 12rpx;
  flex-shrink: 0;
}
.noisbn-book-footer {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  justify-content: center;
}
.noisbn-book-btn {
  padding: 18rpx 60rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  text-align: center;
  cursor: pointer;
}
.noisbn-book-cancel {
  background: #f5f7fa;
  color: #606266;
}
</style>
