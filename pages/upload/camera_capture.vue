<template>
	<view class="cc-page">
		<!-- 摄像头预览区（WebRTC） -->
		<view class="cc-camera-wrap">
			<video id="ccVideo" class="cc-video" autoplay playsinline muted></video>
			<canvas id="ccCanvas" class="cc-canvas" style="display:none;"></canvas>
			<view class="cc-camera-hint" v-if="!ctxReady">
				<text class="cc-hint-text">{{ hintText }}</text>
			</view>
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
				hintText: '摄像头启动中...'
			}
		},
		onReady() {
			this.startCamera()
		},
		onUnload() {
			this.stopCamera()
		},
		methods: {
			startCamera() {
				var that = this
				this.hintText = '摄像头启动中...'
				try {
					setTimeout(function() {
						var video = document.getElementById('ccVideo')
						if (!video) {
							that.hintText = '视频组件加载失败'
							return
						}
						navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 1280, height: 720 } })
							.then(function(stream) {
								that.mediaStream = stream
								video.srcObject = stream
								video.play()
								that.ctxReady = true
								that.hintText = ''
								console.log('摄像头已就绪(WebRTC)')
							})
							.catch(function(err) {
								console.error('getUserMedia失败:', err)
								that.hintText = '摄像头访问被拒绝: ' + (err.message || '')
							})
					}, 500)
				} catch (e) {
					console.error('摄像头启动异常:', e)
					this.hintText = '摄像头启动异常'
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
				// 用 canvas 截取 video 帧
				var video = document.getElementById('ccVideo')
				var canvas = document.getElementById('ccCanvas')
				if (!video || !canvas) {
					uni.showToast({ title: '拍照失败', icon: 'none' })
					return
				}
				canvas.width = video.videoWidth || 1280
				canvas.height = video.videoHeight || 720
				var ctx = canvas.getContext('2d')
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
				// 转 blob 后生成本地临时文件路径
				var that = this
				canvas.toBlob(function(blob) {
					if (!blob) {
						// fallback: data url
						var dataUrl = canvas.toDataURL('image/jpeg', 0.85)
						that.capturedList.push(dataUrl)
						return
					}
					// 用 FileReader 读 blob 为 dataUrl，走 uni.saveFile
					var reader = new FileReader()
					reader.onloadend = function() {
						var base64 = reader.result
						if (base64) {
							// 直接存 base64 data url
							that.capturedList.push(base64)
						}
					}
					reader.readAsDataURL(blob)
				}, 'image/jpeg', 0.85)
			},
			deletePhoto(idx) {
				this.capturedList.splice(idx, 1)
			},
			confirmCapture() {
				if (this.capturedList.length === 0) {
					uni.showToast({ title: '请先拍照', icon: 'none' })
					return
				}
				// 停止摄像头
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
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #111;
		padding: 40rpx;
	}
	.cc-hint-text {
		color: #999;
		font-size: 28rpx;
		text-align: center;
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
