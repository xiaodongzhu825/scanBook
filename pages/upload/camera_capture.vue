<template>
	<view class="cc-page">
		<!-- 摄像头预览区 -->
		<view class="cc-camera-wrap">
			<video id="ccVideo" ref="ccVideo" class="cc-video" autoplay playsinline muted v-if="useWebRTC"></video>
			<view class="cc-camera-hint" v-if="!useWebRTC">
				<text class="cc-hint-text">点击拍照按钮调用系统相机</text>
			</view>
			<canvas id="ccCanvas" ref="ccCanvas" class="cc-canvas" style="display:none;"></canvas>
		</view>

		<!-- 已拍照九宫格 -->
		<view class="cc-thumb-bar">
			<view class="cc-thumb-count" v-if="capturedList.length > 0">已拍 {{ capturedList.length }} 张</view>
			<view class="cc-thumb-list">
				<view class="cc-thumb-item" v-for="(img, idx) in capturedList" :key="idx">
					<image class="cc-thumb-img" :src="img" mode="aspectFill"></image>
					<view class="cc-thumb-del" @click.stop="deletePhoto(idx)">
						<text class="cc-del-icon">✕</text>
					</view>
				</view>
				<view class="cc-thumb-item cc-thumb-placeholder" v-for="n in (9 - capturedList.length)" :key="'p'+n">
				</view>
			</view>
		</view>

		<!-- 底部操作区 -->
		<view class="cc-footer">
			<view class="cc-capture-btn" @click="capturePhoto" :class="{ disabled: capturedList.length >= 9 }">
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
				mediaStream: null,
				ctxReady: false,
				useWebRTC: false
			}
		},
		onReady() {
			this.checkEnvironment()
		},
		onUnload() {
			this.stopCamera()
		},
		methods: {
			// 检测运行环境
			checkEnvironment() {
				// H5 环境：document 存在且 getUserMedia 可用
				try {
					if (typeof document !== 'undefined' && typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
						this.useWebRTC = true
						this.startWebRTC()
					} else {
						this.useWebRTC = false
						this.ctxReady = true
					}
				} catch (e) {
					this.useWebRTC = false
					this.ctxReady = true
				}
			},
			// WebRTC 启动摄像头（H5 环境）
			startWebRTC() {
				var that = this
				try {
					if (typeof document === 'undefined') {
						this.ctxReady = true
						return
					}
					var video = document.getElementById('ccVideo')
					if (!video) {
						this.ctxReady = true
						return
					}
					navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } })
						.then(function(stream) {
							that.mediaStream = stream
							video.srcObject = stream
							video.play()
							that.ctxReady = true
							console.log('WebRTC摄像头已就绪')
						})
						.catch(function(err) {
							console.error('getUserMedia失败:', err)
							that.ctxReady = true
						})
				} catch (e) {
					console.error('摄像头启动异常:', e)
					this.ctxReady = true
				}
			},
			stopCamera() {
				if (this.mediaStream) {
					var tracks = this.mediaStream.getTracks()
					for (var i = 0; i < tracks.length; i++) {
						tracks[i].stop()
					}
					this.mediaStream = null
				}
			},
			capturePhoto() {
				if (this.capturedList.length >= 9) {
					uni.showToast({ title: '最多拍9张', icon: 'none' })
					return
				}
				if (this.useWebRTC && this.mediaStream && this.ctxReady) {
					this.webRTCCapture()
				} else {
					this.systemCapture()
				}
			},
			// WebRTC 截图
			webRTCCapture() {
				if (typeof document === 'undefined') {
					this.systemCapture()
					return
				}
				var canvas = document.getElementById('ccCanvas')
				var video = document.getElementById('ccVideo')
				if (!canvas || !video) {
					this.systemCapture()
					return
				}
				canvas.width = video.videoWidth || 1280
				canvas.height = video.videoHeight || 720
				var ctx = canvas.getContext('2d')
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
				var dataUrl = canvas.toDataURL('image/jpeg', 0.85)
				this.capturedList.push(dataUrl)
			},
			// 系统相机拍照
			systemCapture() {
				var that = this
				uni.chooseImage({
					count: 1,
					sourceType: ['camera'],
					sizeType: ['original'],
					success: function(res) {
						if (res.tempFilePaths && res.tempFilePaths.length > 0) {
							that.capturedList.push(res.tempFilePaths[0])
						}
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
				this.stopCamera()
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
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.cc-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.cc-canvas {
		display: none;
	}
	.cc-camera-hint {
		text-align: center;
		padding: 40rpx;
	}
	.cc-hint-text {
		color: #999;
		font-size: 28rpx;
	}
	.cc-thumb-bar {
		background: #1a1a1a;
		padding: 16rpx 20rpx;
	}
	.cc-thumb-count {
		color: #999;
		font-size: 22rpx;
		margin-bottom: 12rpx;
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
	.cc-capture-btn.disabled {
		opacity: 0.4;
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
