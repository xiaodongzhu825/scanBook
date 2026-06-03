<template>
	<view class="login-container">
		<!-- 加载状态遮罩 -->
		<view class="loading-mask" v-if="isCheckingLogin">
			<view class="loading-spinner"></view>
		</view>
		
		<!-- Logo区域 -->
		<view class="logo-area" v-if="!isCheckingLogin">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="app-name">扫码图书</text>
		</view>

		<!-- 登录表单 -->
		<view class="login-form" v-if="!isCheckingLogin">
			<!-- 账号输入 -->
			<view class="form-item">
				<view class="icon-box">
					<view class="icon-user-head"></view>
					<view class="icon-user-body"></view>
				</view>
				<input
					class="input"
					type="text"
					v-model="formData.account"
					placeholder="请输入账号"
					maxlength="20"
				/>
			</view>

			<!-- 密码输入 -->
			<view class="form-item">
				<view class="icon-box">
					<view class="icon-lock-body"></view>
					<view class="icon-lock-top"></view>
				</view>
				<input
					class="input"
					:type="showPassword ? 'text' : 'password'"
					v-model="formData.password"
					placeholder="请输入密码"
					maxlength="20"
				/>
				<view class="icon-eye-box" @click="togglePassword">
					<view class="icon-eye-outer"></view>
					<view class="icon-eye-inner"></view>
				</view>
			</view>

			<!-- 记住密码 -->
			<view class="remember-row">
				<view class="checkbox-wrapper" @click="toggleRemember">
					<view :class="['checkbox', { checked: formData.remember }]">
						<text v-if="formData.remember" class="check-mark">✓</text>
					</view>
					<text class="checkbox-label">记住密码</text>
				</view>
			</view>

			<!-- 隐私协议同意 -->
			<view class="agreement-row">
				<view class="checkbox-wrapper" @click="toggleAgreement">
					<view :class="['checkbox', { checked: formData.agreed }]">
						<text v-if="formData.agreed" class="check-mark">✓</text>
					</view>
					<text class="checkbox-label">我已阅读并同意</text>
				</view>
				<text class="link" @click="showPrivacyPolicy">《隐私协议》</text>
			</view>

			<!-- 登录按钮 -->
			<button class="login-btn" :disabled="!canLogin" @click="handleLogin">
				登录
			</button>
		</view>

		<!-- 隐私协议弹窗 -->
		<view class="modal-mask" v-if="showModal" @click="closeModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">隐私协议</text>
					<text class="close-btn" @click="closeModal">✕</text>
				</view>
				<scroll-view class="modal-body" scroll-y>
					<view class="policy-content">
						<text class="policy-title">入库助手-大商道小程序隐私协议</text>
						<view class="policy-intro">
							<text>本指引是入库助手-大商道小程序开发者"沈阳大商道商贸有限公司"（以下简称"开发者"）为处理你的个人信息而制定。</text>
						</view>
						
						<view class="policy-section">
							<text class="section-title">开发者处理的信息</text>
							<text class="section-item">· 为了用户注册用户账号，开发者将在获取你的明示同意后，收集你的手机号。</text>
							<text class="section-item">· 为了用户注册用户账号，开发者将在获取你的明示同意后，收集你的微信昵称、头像。</text>
							<text class="section-item">· 为了客户跟商家沟通会发送图片，开发者将在获取你的明示同意后，访问你的摄像头。</text>
							<text class="section-item">· 为了用于保存商城图片，开发者将在获取你的明示同意后，使用你的相册（仅写入）权限。</text>
							<text class="section-item">· 为了用于下单快速录入地址，开发者将在获取你的明示同意后，收集你的位置信息。</text>
							<text class="section-item">· 开发者收集你的地址，用于下单快速录入地址。</text>
							<text class="section-item">· 开发者收集你的设备信息，用于判断客户身份，如果恶意请求则限制设备。</text>
							<text class="section-item">· 开发者收集你选中的照片或视频信息，用于客户跟商家沟通会发送图片。</text>
							<text class="section-item">· 开发者收集你的操作日志，用于记录用户操作信息，方便分析问题、故障。</text>
							<text class="section-item">· 开发者收集你选中的文件，用于与商家沟通退货时的上传凭证。</text>
						</view>
						
						<view class="policy-section">
							<text class="section-title">未成年人保护</text>
							<text class="section-text">根据相关法律法规的规定，若你是14周岁以下的未成年人，你需要和你的监护人共同仔细阅读本指引，并在征得监护人明示同意后继续使用小程序服务。</text>
							<text class="section-text">开发者将根据相关法律法规的规定及本指引内容，处理经监护人同意而收集的未成年人用户信息，并通过本指引你的权益部分披露的内容保障未成年人在个人信息处理活动中的各项权利。</text>
						</view>
						
						<view class="policy-section">
							<text class="section-title">你的权益</text>
							<text class="section-text">关于访问你的摄像头，你可以通过以下路径：小程序主页右上角"..."—"设置"—点击特定信息—点击"不允许"，撤回对开发者的授权。</text>
							<text class="section-text">关于你的个人信息，你可以通过以下方式与开发者联系，行使查阅、复制、更正、删除等法定权利。</text>
							<text class="section-text">若你在小程序中注册了账号，你可以通过以下方式与开发者联系，申请注销你在小程序中使用的账号。在受理你的申请后，开发者承诺在十五个工作日内完成核查和处理，并按照法律法规要求处理你的相关信息。</text>
							<text class="section-text">邮箱: admin@qinsilk.com</text>
						</view>
						
						<view class="policy-section">
							<text class="section-title">开发者对信息的存储</text>
							<text class="section-text">开发者承诺，除法律法规另有规定外，开发者对你的信息的保存期限应当为实现处理目的所必要的最短时间。</text>
						</view>
						
						<view class="policy-section">
							<text class="section-title">信息的使用规则</text>
							<text class="section-text">开发者将会在本指引所明示的用途内使用收集的信息。</text>
							<text class="section-text">如开发者使用你的信息超出本指引目的或合理范围，开发者必须在变更使用目的或范围前，再次以通过公告方式告知并征得你的明示同意。</text>
						</view>
						
						<view class="policy-section">
							<text class="section-title">信息对外提供</text>
							<text class="section-text">开发者承诺，不会主动共享或转让你的信息至任何第三方，如存在确需共享或转让时，开发者应当直接征得或确认第三方征得你的单独同意。</text>
							<text class="section-text">开发者承诺，不会对外公开披露你的信息，如必须公开披露时，开发者应当向你告知公开披露的目的、披露信息的类型及可能涉及的信息，并征得你的单独同意。</text>
						</view>
						
						<view class="policy-section">
							<text class="section-title">联系我们</text>
							<text class="section-text">若你认为开发者未遵守上述约定，或有其他的投诉建议、或未成年人个人信息保护相关问题，可通过以下方式与开发者联系；或者向微信进行投诉。</text>
							<text class="section-text">邮箱: admin@qinsilk.com</text>
						</view>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<button class="confirm-btn" @click="confirmRead">我已阅读</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isCheckingLogin: true,
			formData: {
				account: '',
				password: '',
				remember: false,
				agreed: false
			},
			showPassword: false,
			showModal: false
		}
	},

	computed: {
		canLogin() {
			return this.formData.account.trim() !== '' &&
				   this.formData.password.trim() !== '' &&
				   this.formData.agreed
		}
	},

	onLoad() {
		// 已登录则直接跳转首页
		const token = uni.getStorageSync('token')
		if (token) {
			uni.redirectTo({ url: '/pages/home/home' })
			return
		}
		// 未登录，显示登录页
		this.isCheckingLogin = false
		// 页面加载时读取记住的账号密码
		this.loadRememberedCredentials()
	},

	methods: {
		// 切换密码显示
		togglePassword() {
			this.showPassword = !this.showPassword
		},

		// 切换记住密码
		toggleRemember() {
			this.formData.remember = !this.formData.remember
		},

		// 切换协议同意
		toggleAgreement() {
			this.formData.agreed = !this.formData.agreed
		},

		// 显示隐私协议
		showPrivacyPolicy() {
			this.showModal = true
		},

		// 关闭弹窗
		closeModal() {
			this.showModal = false
		},

		// 确认已阅读隐私协议
		confirmRead() {
			this.formData.agreed = true
			this.showModal = false
		},

		// 登录处理
		handleLogin() {
			if (!this.canLogin) {
				uni.showToast({
					title: '请填写完整信息并同意隐私协议',
					icon: 'none'
				})
				return
			}

			// 保存或清除记住的密码
			if (this.formData.remember) {
				this.saveCredentials()
			} else {
				this.clearCredentials()
			}

			uni.showLoading({
				title: '登录中...',
				mask: true
			})

			// 构建登录参数（form-data格式）
			const loginData = {
				clientId: 'cec96a240989d1c6bcd55f86fca702b7',
				phoneNumber: this.formData.account,
				password: this.formData.password
			}

			// 调用登录API
			uni.request({
				url: 'https://api.buzhiyushu.cn/auth/interFaceLogin',
				method: 'POST',
				header: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': 'Basic ZWxhc3RpYzo1bVJESVVnNTJWQzBmcDE0bnctRg=='
				},
				data: loginData,
				success: (res) => {
					uni.hideLoading()
					const response = res.data

					// 新接口返回结构：{ code: 200, msg: "操作成功", data: { access_token, userId, ... } }
					if (response && response.code === 200 && response.data && response.data.access_token) {
						const data = response.data
						// 登录成功，保存数据
						uni.setStorageSync('token', data.access_token)
						uni.setStorageSync('psi_token', data.access_token)
						uni.setStorageSync('openId', data.openid || '')
						uni.setStorageSync('userId', data.userId || '')
						uni.setStorageSync('phoneNumber', data.phoneNumber || this.formData.account)
						uni.setStorageSync('remembered_password', this.formData.password)
						uni.setStorageSync('nickName', data.nickName || '')
						uni.setStorageSync('lastSubmitTime', Date.now())
						uni.setStorageSync('agreedPrivacy', true)

						// 调用商户记录接口
						if (data.userId) {
							uni.request({
								url: `https://go.order.service.buzhiyushu.cn/api/user/insertRecbusinessByUserId?userId=${data.userId}&sort=1`,
								method: 'GET'
							})
						}

						uni.showToast({
							title: '登录成功',
							icon: 'success'
						})

						// 跳转到功能入口页面
						setTimeout(() => {
							uni.redirectTo({
								url: '/pages/entry/entry'
							})
						}, 1500)
					} else {
						uni.showToast({
							title: response.msg || response.message || '登录失败，请检查账号密码',
							icon: 'none',
							duration: 3000
						})
					}
				},
				fail: () => {
					uni.hideLoading()
					uni.showToast({ title: '网络请求失败', icon: 'none' })
				}
			})
		},

		// 保存账号密码到本地
		saveCredentials() {
			uni.setStorageSync('remembered_account', this.formData.account)
			uni.setStorageSync('remembered_password', this.formData.password)
			uni.setStorageSync('remember_flag', true)
		},

		// 清除保存的账号密码
		clearCredentials() {
			uni.removeStorageSync('remembered_account')
			uni.removeStorageSync('remembered_password')
			uni.setStorageSync('remember_flag', false)
		},

		// 加载记住的账号密码
		loadRememberedCredentials() {
			const rememberFlag = uni.getStorageSync('remember_flag')
			if (rememberFlag) {
				this.formData.account = uni.getStorageSync('remembered_account') || ''
				this.formData.password = uni.getStorageSync('remembered_password') || ''
				this.formData.remember = true
			}
		}
	}
}
</script>

<style>
.login-container {
	min-height: 100vh;
	background: #ffffff;
	padding: 0 40rpx;
	box-sizing: border-box;
}

/* 加载遮罩 */
.loading-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
}

.loading-spinner {
	width: 40rpx;
	height: 40rpx;
	border: 3rpx solid #e0e0e0;
	border-top-color: #409eff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* Logo区域 */
.logo-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 100rpx;
	padding-bottom: 60rpx;
}

.logo {
	width: 140rpx;
	height: 140rpx;
	border-radius: 16rpx;
}

.app-name {
	font-size: 40rpx;
	color: #1d2129;
	font-weight: 500;
	margin-top: 24rpx;
}

/* 登录表单 */
.login-form {
	background: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
}

.form-item {
	display: flex;
	align-items: center;
	background: #f5f7fa;
	border-radius: 12rpx;
	padding: 24rpx 20rpx;
	margin-bottom: 24rpx;
}

/* 图标容器 */
.icon-box {
	width: 36rpx;
	height: 36rpx;
	margin-right: 16rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 用户图标 - 头部 */
.icon-user-head {
	width: 16rpx;
	height: 16rpx;
	border: 2rpx solid #909399;
	border-radius: 50%;
	position: absolute;
	top: 2rpx;
}

/* 用户图标 - 身体 */
.icon-user-body {
	width: 28rpx;
	height: 12rpx;
	border: 2rpx solid #909399;
	border-bottom: none;
	border-radius: 14rpx 14rpx 0 0;
	position: absolute;
	bottom: 2rpx;
}

/* 锁图标 - 锁身 */
.icon-lock-body {
	width: 24rpx;
	height: 20rpx;
	border: 2rpx solid #909399;
	border-radius: 4rpx;
	position: absolute;
	bottom: 2rpx;
}

/* 锁图标 - 锁环 */
.icon-lock-top {
	width: 14rpx;
	height: 10rpx;
	border: 2rpx solid #909399;
	border-bottom: none;
	border-radius: 7rpx 7rpx 0 0;
	position: absolute;
	top: 2rpx;
	left: 50%;
	transform: translateX(-50%);
}

/* 眼睛图标容器 */
.icon-eye-box {
	width: 36rpx;
	height: 36rpx;
	padding: 8rpx;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 眼睛图标 - 外框 */
.icon-eye-outer {
	width: 22rpx;
	height: 12rpx;
	border: 2rpx solid #909399;
	border-radius: 50%;
	position: absolute;
}

/* 眼睛图标 - 眼珠 */
.icon-eye-inner {
	width: 4rpx;
	height: 4rpx;
	background: #909399;
	border-radius: 50%;
	position: absolute;
}

.input {
	flex: 1;
	font-size: 30rpx;
	color: #1d2129;
	background: transparent;
	border: none;
	outline: none;
}

/* 记住密码 */
.remember-row {
	margin-top: 16rpx;
	margin-bottom: 16rpx;
}

/* 隐私协议 */
.agreement-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	margin-top: 8rpx;
	margin-bottom: 32rpx;
}

.checkbox-wrapper {
	display: flex;
	align-items: center;
}

.checkbox {
	width: 32rpx;
	height: 32rpx;
	border: 2rpx solid #dcdfe6;
	border-radius: 4rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10rpx;
}

.checkbox.checked {
	background: #409eff;
	border-color: #409eff;
}

.check-mark {
	color: #ffffff;
	font-size: 22rpx;
	font-weight: bold;
}

.checkbox-label {
	font-size: 26rpx;
	color: #4e5969;
}

.link {
	font-size: 26rpx;
	color: #409eff;
}

/* 登录按钮 */
.login-btn {
	width: 100%;
	height: 88rpx;
	background: #409eff;
	border-radius: 12rpx;
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
}

.login-btn[disabled] {
	background: #a0cfff;
	color: #ffffff;
}

/* 弹窗样式 */
.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.modal-content {
	width: 92%;
	max-height: 80vh;
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 24rpx;
	border-bottom: 1rpx solid #ebeef5;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #1d2129;
}

.close-btn {
	font-size: 36rpx;
	color: #86909c;
	padding: 8rpx;
}

.modal-body {
	flex: 1;
	max-height: 60vh;
	padding: 20rpx 32rpx;
	box-sizing: border-box;
}

.policy-content {
	display: flex;
	flex-direction: column;
	padding-bottom: 20rpx;
}

.policy-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #303133;
	margin-bottom: 16rpx;
	text-align: center;
}

.policy-intro {
	margin-bottom: 16rpx;
}

.policy-intro text {
	font-size: 24rpx;
	color: #606266;
	line-height: 1.6;
	word-break: break-all;
}

.policy-section {
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 26rpx;
	font-weight: 500;
	color: #303133;
	margin-bottom: 10rpx;
	display: block;
}

.section-item {
	font-size: 24rpx;
	color: #606266;
	line-height: 1.7;
	display: block;
	margin-bottom: 6rpx;
	word-break: break-all;
}

.section-text {
	font-size: 24rpx;
	color: #606266;
	line-height: 1.7;
	display: block;
	margin-bottom: 6rpx;
	word-break: break-all;
}

.modal-footer {
	padding: 28rpx 36rpx;
	border-top: 1rpx solid #ebeef5;
}

.confirm-btn {
	width: 100%;
	height: 76rpx;
	background: #409eff;
	border-radius: 12rpx;
	color: #ffffff;
	font-size: 28rpx;
	border: none;
}
</style>