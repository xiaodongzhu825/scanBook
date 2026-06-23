<script>
	
	// #ifdef APP-PLUS
	import checkUpdate from '@/uni_modules/uni-upgrade-center-app/utils/check-update';
	// #endif
	export default {
		onLaunch: function() {
			console.log('App Launch')

			// 全局拦截器：API 返回无效令牌时跳转登录
			uni.addInterceptor('request', {
				success: function(res) {
					if (res.data && typeof res.data === 'string') {
						try {
							var obj = JSON.parse(res.data)
							if (obj && obj.error === '无效的认证令牌') {
								uni.removeStorageSync('token')
								uni.reLaunch({ url: '/pages/login/login' })
							}
						} catch (e) {}
					} else if (res.data && res.data.error === '无效的认证令牌') {
						uni.removeStorageSync('token')
						uni.reLaunch({ url: '/pages/login/login' })
					}
				}
			})

			// #ifdef APP-PLUS
			// 版本更新检测（放在 onLaunch 最前面，尽早执行）
			console.log('[Upgrade] 开始检测更新...');
			checkUpdate();
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* ====== 全局设计系统 ====== */
	page {
		/* 主色 - 仅用于交互元素 */
		--color-primary: #409eff;
		--color-primary-light: #ecf5ff;
		--color-primary-disabled: #a0cfff;
		
		/* 背景色 - 以白色为主 */
		--bg-page: #f5f6fa;
		--bg-card: #ffffff;
		--bg-secondary: #f5f7fa;
		--bg-tertiary: #f0f2f5;
		
		/* 文字色 - 中性灰阶 */
		--text-primary: #1d2129;
		--text-regular: #4e5969;
		--text-secondary: #86909c;
		--text-placeholder: #c9cdd4;
		--text-disabled: #e5e6eb;
		
		/* 边框 */
		--border-color: #e5e6eb;
		--border-light: #f2f3f5;
		
		/* 语义色 - 极简使用 */
		--color-danger: #f77234;
		--color-success: #00b42a;
		--color-warning: #ff7d00;
		
		/* 阴影 - 更柔和 */
		--shadow-sm: 0 1rpx 4rpx rgba(0,0,0,0.04);
		--shadow-md: 0 2rpx 8rpx rgba(0,0,0,0.06);
		--shadow-lg: 0 4rpx 16rpx rgba(0,0,0,0.08);
		
		/* 圆角 */
		--radius-sm: 8rpx;
		--radius-md: 12rpx;
		--radius-lg: 16rpx;
		--radius-xl: 20rpx;
		
		/* 间距 */
		--spacing-page: 28rpx;
		--spacing-card: 24rpx;
		--spacing-section: 20rpx;
		
		background: var(--bg-page);
		font-size: 28rpx;
		color: var(--text-primary);
	}

	/* 全局重置 */
	view, text, input, button, scroll-view {
		box-sizing: border-box;
	}
	
	/* 通用卡片样式 */
	.card {
		background: var(--bg-card);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	/* 主按钮 */
	.btn-primary {
		background: var(--color-primary);
		color: #ffffff;
		border-radius: var(--radius-md);
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		font-weight: 500;
		border: none;
	}
	.btn-primary:active {
		opacity: 0.85;
	}
	.btn-primary[disabled] {
		background: var(--color-primary-disabled);
		color: rgba(255,255,255,0.7);
	}

	/* 输入框统一风格 */
	.field-input, input[type="text"], input[type="password"] {
		background: var(--bg-secondary);
		border: 2rpx solid transparent;
		border-radius: var(--radius-sm);
		padding: 20rpx 24rpx;
		font-size: 28rpx;
		color: var(--text-primary);
		transition: border-color 0.2s;
	}
	.field-input:focus, input:focus {
		border-color: var(--color-primary);
	}

	/* 页面标题 */
	.page-title {
		font-size: 32rpx;
		font-weight: 600;
		color: var(--text-primary);
	}
	
	/* 状态标签 */
	.tag {
		display: inline-flex;
		align-items: center;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		font-size: 22rpx;
	}
	.tag-blue { background: var(--color-primary-light); color: var(--color-primary); }
	.tag-green { background: #e8ffea; color: var(--color-success); }
	.tag-orange { background: #fff3e8; color: var(--color-warning); }
	.tag-red { background: #fff1e8; color: var(--color-danger); }
	.tag-gray { background: var(--bg-tertiary); color: var(--text-secondary); }
</style>
