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

						<!-- 货区 & ISBN -->
						<view class="form-section">
							<view class="field-label">
								<text class="label-text">货区 & ISBN</text>
							</view>
							<view class="inline-fields" style="flex:1;">
								<view class="inline-field wide">
									<view class="picker-box" style="flex:1;" @click="openWarehousePicker('isbn')">
										<text class="picker-value">{{ isbnSelectedArea || '请选择货区' }}</text>
										<text class="picker-arrow">›</text>
									</view>
								</view>
								<view class="inline-field narrow">
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
						</view>

						<!-- 在售商品 -->
						<view class="form-section">
							<view class="section-header-row">
								<view class="section-title">
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
									<text class="grid-price-detail" v-if="item.shippingFee > 0">书¥{{ item.bookPrice.toFixed(2) }}+运¥{{ item.shippingFee.toFixed(2) }}</text>
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
					<!-- 货位搜索 -->
					<view class="wh-search-bar">
						<input class="wh-search-input" v-model="popupLocationSearch" placeholder="搜索货位编码/名称" @input="onLocationSearchInput" />
						<text class="wh-search-clear" v-if="popupLocationSearch" @click="clearLocationSearch">✕</text>
					</view>
					<scroll-view class="wh-location-list" scroll-y @scrolltolower="loadMorePopupLocation">
						<view 
							class="wh-loc-item" 
							v-for="loc in filteredLocationList" 
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
	</view>
</template>

<script>
import { getWarehouseList, getLocationList, searchBookByIsbn } from '@/utils/api.js'
import { login as kongfzLogin, searchProducts, searchFacet } from '@/utils/kongfz.js'

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
			selectedCondition: '六品',
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
				list = list.filter(item => item.shopName === this.filterPress)
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
		filterPublishers() {
			const set = new Set()
			this.productList.slice(0, 12).forEach(item => {
				if (item.shopName) set.add(item.shopName)
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
			// 必须已登录孔网，否则直接弹窗不打开摄像头
			if (!this.isLoggedIn) {
				uni.showToast({ title: '请先登录孔网账号', icon: 'none' })
				return
			}
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
				console.log('仓库列表原始响应:', JSON.stringify(res))
				const list = res.data?.list || res.data?.records || res.list || res.records || []
				if (list.length > 0) {
					this.popupWarehouseList = list
					this.popupActiveWhIndex = 0
					this.loadPopupLocations(list[0].id)
				} else {
					console.warn('仓库列表为空, 响应code:', res.code, '响应data:', JSON.stringify(res.data))
				}
			} catch (e) {
				console.error('加载仓库失败:', e)
				const errMsg = e.message || String(e)
				if (errMsg.includes('NEED_LOGIN')) {
					const displayMsg = errMsg.replace('NEED_LOGIN:', '')
					uni.showModal({
						title: '系统提示',
						content: displayMsg,
						showCancel: false
					})
				}
			} finally {
				this.popupLoading = false
			}
		},

		async loadPopupLocations(warehouseId) {
			this.popupLoadingLocation = true
			this.popupLocPage = 1
			this.popupLocHasMore = true
			this.popupAllLocationList = []
			try {
				const res = await getLocationList({
					warehouse_id: warehouseId, type: 1, status: 1,
					page: 1, page_size: 999
				})
				console.log('【货位列表】load响应:', JSON.stringify(res))
				// 兼容多种响应格式
				let list = []
				if (res.code === 0 && res.data) {
					list = res.data.list || res.data.records || []
				}
				if (list.length === 0) {
					list = res.list || res.records || []
				}
				if (list.length > 0) {
					this.popupLocationList = list
					this.popupAllLocationList = list
					this.popupLocHasMore = false
				} else {
					console.warn('货位列表为空', JSON.stringify(res))
				}
			} catch (e) {
				console.error('加载货位失败:', e)
				const errMsg = e.message || String(e)
				if (errMsg.includes('NEED_LOGIN')) {
					const displayMsg = errMsg.replace('NEED_LOGIN:', '')
					uni.showModal({
						title: '系统提示',
						content: displayMsg,
						showCancel: false
					})
				}
				this.popupLocationList = this.popupAllLocationList
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
						this.popupAllLocationList = [...this.popupAllLocationList, ...newList]
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

			const warehouseData = this.currentTab === 'isbn' ? this.isbnWarehouseData : this.noIsbnWarehouseData
			if (!warehouseData) {
				uni.showToast({ title: '请选择货区', icon: 'none' })
				return
			}

			// ISBN与售价不能为空
			if (!this.isbn) {
				uni.showToast({ title: 'ISBN不能为空', icon: 'none' })
				return
			}
			if (!this.price) {
				uni.showToast({ title: '售价不能为空', icon: 'none' })
				return
			}

			// 确认弹窗
			const warehouseName = warehouseData.warehouseName || warehouseData.name || ''
			const locCode = warehouseData.locationCode || warehouseData.code || ''
			const locationText = warehouseName + (locCode ? ' - ' + locCode : '')
			const isbn = this.isbn || '-'
			const bookName = this.bookName || '-'
			const price = this.price || '-'
			const stock = this.stock ?? '-'
			const author = this.author || '-'
			const publisher = this.publisher || '-'
			const fixPrice = this.fixPrice || '-'
			const printTime = this.printTime || '-'
			const photoCount = this.photoList.length

			const contentLines = [
				'📦 货区：' + locationText,
				'📖 ISBN：' + isbn,
				'📕 书名：' + bookName,
				'💰 价格：' + price,
				'📊 库存：' + stock,
				'✍️ 作者：' + author,
				'🏢 出版社：' + publisher,
				'🏷️ 定价：' + fixPrice,
				'📅 印刷时间：' + printTime,
				'📷 图片：' + photoCount + '张'
			]

			uni.showModal({
				title: '确认上传',
				content: contentLines.join('\n'),
				confirmText: '确认上传',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						this.doSubmit(warehouseData)
					} else {
						this.isSubmitting = false
					}
				}
			})
		},

		doSubmit(warehouseData) {
			this.isSubmitting = true
			uni.showLoading({ title: '上传中...' })
			setTimeout(() => {
				uni.hideLoading()
				this.isSubmitting = false
				uni.showToast({ title: '上传成功', icon: 'success' })
				// 清空表单待后续对接真实API
			}, 1500)
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
  width: 160rpx;
}

.inline-field.wide {
  flex: 1;
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
  padding: 0 60rpx 0 16rpx;
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
  right: 24rpx;
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
</style>
