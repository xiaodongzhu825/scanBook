<template>
	<view class="cc-page">
		<!-- 摄像头预览区 -->
		<view class="cc-camera-wrap">
			<camera id="ccCamera" class="cc-camera" device-position="back" flash="off" @error="onCameraError" @initdone="onCameraInit"></camera>
			<view class="cc-camera-hint" v-if="!ctxReady">
				<text class="cc-hint-text">摄像头初始化中...</text>
			</view>
		</view>

		<!-- 已拍照九宫格 -->
		<view class="cc-thumb-bar">
			<view class="cc-thumb-list">
				<view class="cc-thumb-item" v-for="(img, idx) in capturedList" :key="idx">
					<image class="cc-thumb-img" :src="img" mode="aspectFill"></image>
					<view class="cc-thumb-del" @click="deletePhoto(idx)">
						<text class="cc-del-icon">✕</text>
					</view>
				</view>
				<view class="cc-thumb-item cc-thumb-placeholder" v-for="n in (9 - capturedList.length)" :key="'p'+n">
				</view>
			</view>
		</view>

		<!-- 底部操作区 -->
		<view class="cc-footer">
			<view class="cc-capture-btn" @click="capturePhoto" :class="{ disabled: !ctxReady }">
				<view class="cc-capture-inner"></view>
			</view>
			<view class="cc-confirm-btn" @click="confirmCapture" :class="{ disabled: capturedList.length === 0 }">
				<text class="cc-confirm-text">确认 ({{ capturedList.length }})</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				capturedList: [],
				ctx: null,
				ctxReady: false
			}
		},
		onReady() {
			this.initCamera()
		},
		methods: {
			initCamera() {
				try {
					this.ctx = uni.createCameraContext()
					if (this.ctx) {
						this.ctxReady = true
						console.log('摄像头已就绪')
					} else {
						// 延时重试
						setTimeout(() => this.initCamera(), 500)
					}
				} catch (e) {
					console.error('摄像头初始化失败:', e)
					// 延时重试
					setTimeout(() => this.initCamera(), 500)
				}
			},
			onCameraInit() {
				console.log('摄像头initdone')
				this.initCamera()
			},
			onCameraError(e) {
				console.error('摄像头错误:', e)
				uni.showToast({ title: '摄像头启动失败', icon: 'none', duration: 3000 })
			},
			capturePhoto() {
				if (this.capturedList.length >= 9) {
					uni.showToast({ title: '最多拍9张', icon: 'none' })
					return
				}
				if (!this.ctx || !this.ctxReady) {
					uni.showToast({ title: '摄像头未就绪', icon: 'none' })
					return
				}
				uni.showLoading({ title: '拍照中...', mask: true })
				this.ctx.takePhoto({
					quality: 'high',
					success: (res) => {
						uni.hideLoading()
						this.capturedList.push(res.tempImagePath)
					},
					fail: (err) => {
						uni.hideLoading()
						console.error('拍照失败:', err)
						uni.showToast({ title: '拍照失败', icon: 'none' })
					}
				})
			},
			deletePhoto(idx) {
				this.capturedList.splice(idx, 1)
			},
			confirmCapture() {
				if (this.capturedList.length === 0) {
					uni.showToast({ title: '请先拍照', icon: 'none' })
					return
				}
				var pages = getCurrentPages()
				var prevPage = pages[pages.length - 2]
				if (prevPage) {
					prevPage.$vm.capturedPhotoList = this.capturedList
				}
				uni.navigateBack()
			}
		}
	}
</script>

<style>
	.cc-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #000;
		overflow: hidden;
	}
	.cc-camera-wrap {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: #111;
	}
	.cc-camera {
		width: 100%;
		height: 100%;
	}
	.cc-camera-hint {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #111;
	}
	.cc-hint-text {
		color: #999;
		font-size: 28rpx;
	}
	.cc-thumb-bar {
		background: #1a1a1a;
		padding: 16rpx 20rpx;
	}
	.cc-thumb-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}
	.cc-thumb-item {
		width: 100rpx;
		height: 100rpx;
		border-radius: 10rpx;
		overflow: hidden;
		position: relative;
		background: #333;
	}
	.cc-thumb-img {
		width: 100%;
		height: 100%;
	}
	.cc-thumb-del {
		position: absolute;
		top: -6rpx;
		right: -6rpx;
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background: rgba(0,0,0,0.6);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.cc-del-icon {
		color: #fff;
		font-size: 18rpx;
	}
	.cc-thumb-placeholder {
		border: 2rpx dashed #444;
		box-sizing: border-box;
	}
	.cc-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 40rpx;
		padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
		background: #1a1a1a;
		gap: 60rpx;
	}
	.cc-capture-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		border: 6rpx solid #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.3s;
	}
	.cc-capture-btn.disabled {
		opacity: 0.4;
	}
	.cc-capture-inner {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: #fff;
	}
	.cc-capture-btn:active .cc-capture-inner {
		background: #ccc;
	}
	.cc-confirm-btn {
		padding: 18rpx 40rpx;
		border-radius: 40rpx;
		background: #409eff;
	}
	.cc-confirm-btn.disabled {
		background: #555;
	}
	.cc-confirm-text {
		color: #fff;
		font-size: 28rpx;
		font-weight: bold;
	}
</style>
