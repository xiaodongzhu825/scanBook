			<swiper-item>
				<view class="tab-content">
					<scroll-view class="content-scroll" scroll-y="true">
						<!-- 货区选择 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📍</text>
								<text class="title-text">货区选择</text>
							</view>
							<picker @change="handleNoIsbnAreaChange" :value="noIsbnAreaIndex" :range="areaList">
								<view class="picker-box">
									<text class="picker-value">{{ areaList[noIsbnAreaIndex] }}</text>
									<text class="picker-arrow">›</text>
								</view>
							</picker>
						</view>

						<!-- 印刷时间 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📅</text>
								<text class="title-text">印刷时间</text>
							</view>
							<view class="input-with-btn">
								<input 
									class="form-input-flex" 
									v-model="noIsbnPrintTime" 
									placeholder="请输入印刷时间"
								/>
								<view class="action-btn primary" @click="recognizeImage">
									<text class="btn-icon">📷</text>
									<text class="btn-text">识图</text>
								</view>
							</view>
						</view>

						<!-- 书名 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📚</text>
								<text class="title-text">书名</text>
							</view>
							<view class="input-with-btn">
								<input 
									class="form-input-flex" 
									v-model="noIsbnBookName" 
									placeholder="请输入书名"
								/>
								<view class="action-btn" @click="searchBookName">
									<text class="btn-text">搜索</text>
								</view>
							</view>
						</view>

						<!-- 出版社 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">🏢</text>
								<text class="title-text">出版社</text>
							</view>
							<picker @change="handleNoIsbnPublisherChange" :value="noIsbnPublisherIndex" :range="publisherList">
								<view class="picker-box">
									<text class="picker-value">{{ publisherList[noIsbnPublisherIndex] }}</text>
									<text class="picker-arrow">›</text>
								</view>
							</picker>
						</view>

						<!-- 图书分类 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📂</text>
								<text class="title-text">图书分类</text>
							</view>
							<view class="category-select" @click="showCategoryPopup = true">
								<text class="category-value">{{ noIsbnSelectedCategory || '请选择分类' }}</text>
								<text class="picker-arrow">›</text>
							</view>
						</view>

						<!-- 开本 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📐</text>
								<text class="title-text">开本</text>
							</view>
							<picker @change="handleNoIsbnFormatChange" :value="noIsbnFormatIndex" :range="formatList">
								<view class="picker-box">
									<text class="picker-value">{{ formatList[noIsbnFormatIndex] }}</text>
									<text class="picker-arrow">›</text>
								</view>
							</picker>
						</view>

						<!-- 书号 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">🔢</text>
								<text class="title-text">书号</text>
							</view>
							<input 
								class="form-input" 
								v-model="noIsbnBookNumber" 
								placeholder="请输入书号"
							/>
						</view>

						<!-- 定价 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">💵</text>
								<text class="title-text">定价</text>
							</view>
							<view class="price-input-box">
								<text class="price-symbol">¥</text>
								<input 
									class="price-input" 
									v-model="noIsbnOriginalPrice" 
									placeholder="请输入定价"
									type="digit"
								/>
							</view>
						</view>

						<!-- 字数 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📝</text>
								<text class="title-text">字数</text>
							</view>
							<input 
								class="form-input" 
								v-model="noIsbnWordCount" 
								placeholder="请输入字数"
								type="number"
							/>
						</view>

						<!-- ISBN -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📖</text>
								<text class="title-text">ISBN</text>
							</view>
							<input 
								class="form-input" 
								v-model="noIsbnIsbn" 
								placeholder="请输入ISBN（纯数字）"
								type="number"
							/>
						</view>

						<!-- 品相选择 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">⭐</text>
								<text class="title-text">品相</text>
							</view>
							<view class="condition-list">
								<view 
									class="condition-item" 
									v-for="(item, index) in conditionList" 
									:key="index"
									:class="{ active: noIsbnSelectedCondition === item }"
									@click="selectNoIsbnCondition(item)"
								>
									<text class="condition-text">{{ item }}</text>
								</view>
							</view>
						</view>

						<!-- 价格 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">💰</text>
								<text class="title-text">价格</text>
							</view>
							<view class="price-input-box">
								<text class="price-symbol">¥</text>
								<input 
									class="price-input" 
									v-model="noIsbnPrice" 
									placeholder="请输入价格"
									type="digit"
								/>
							</view>
						</view>

						<!-- 库存 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📦</text>
								<text class="title-text">库存</text>
							</view>
							<input 
								class="form-input" 
								v-model="noIsbnStock" 
								placeholder="请输入库存数量"
								type="number"
							/>
						</view>

						<!-- 拍照 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📷</text>
								<text class="title-text">拍照</text>
								<text class="photo-count">已拍{{ noIsbnPhotoList.length }}/9张</text>
							</view>
							<view class="photo-section">
								<view class="photo-list">
									<view class="photo-item" v-for="(photo, index) in noIsbnPhotoList" :key="index">
										<image class="photo-image" :src="photo" mode="aspectFill" @click="previewNoIsbnPhoto(photo, index)"></image>
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

						<!-- 在售商品 -->
						<view class="form-section">
							<view class="section-header-row">
								<view class="section-title">
									<text class="title-icon">🛒</text>
									<text class="title-text">在售商品</text>
								</view>
								<view class="compare-toggle">
									<text class="toggle-btn" :class="{ active: compareType === 'isbn' }" @click="switchCompare('isbn')">ISBN比价</text>
									<text class="toggle-btn" :class="{ active: compareType === 'name' }" @click="switchCompare('name')">书名比价</text>
								</view>
							</view>
							<view class="product-grid">
								<view class="grid-item" v-for="(item, index) in productList.slice(0, 12)" :key="index">
									<image class="grid-image" :src="item.image" mode="aspectFill" @click="previewProductImage(index)"></image>
									<text class="grid-name">{{ item.name }}</text>
									<text class="grid-condition">{{ item.condition }}</text>
									<text class="grid-price">¥{{ item.price }}</text>
								</view>
							</view>
						</view>

						<!-- 上书记录 -->
						<view class="form-section">
							<view class="section-title">
								<text class="title-icon">📝</text>
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
					<!-- 图片预览遮罩 -->
					<view class="photo-preview-mask" v-if="previewVisible" @click="closePreview">
						<swiper class="photo-preview-swiper" :current="previewIndex" @change="onPreviewSwiperChange" circular="true">
							<swiper-item v-for="(photo, idx) in noIsbnPhotoList" :key="idx">
								<image class="photo-preview-img" :src="photo" mode="widthFix" @click.stop></image>
							</swiper-item>
						</swiper>
					</view>
				</view>
			</swiper-item>
