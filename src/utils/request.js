import router from '@/router';
import { doLogout, getCookie } from '@/utils/auth';
import axios from 'axios';

/**
 * 获取 API baseURL
 * 优先使用用户自定义的 API URL（仅在非 Electron 模式下）
 */
function getBaseURL() {
  // Electron 模式下使用固定配置
  if (process.env.IS_ELECTRON) {
    if (process.env.NODE_ENV === 'production') {
      return process.env.VUE_APP_ELECTRON_API_URL;
    } else {
      return process.env.VUE_APP_ELECTRON_API_URL_DEV;
    }
  }

  // Web 模式下，优先使用自定义 API URL
  try {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    if (settings.customNeteaseApiUrl && settings.customNeteaseApiUrl.trim()) {
      return settings.customNeteaseApiUrl.trim();
    }
  } catch (e) {
    console.warn('Failed to parse settings from localStorage', e);
  }

  // 回退到环境变量配置
  return process.env.VUE_APP_NETEASE_API_URL || '';
}

let baseURL = getBaseURL();

const service = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

service.interceptors.request.use(function (config) {
  // 动态获取 baseURL（支持自定义 API URL）
  const currentBaseURL = getBaseURL();
  config.baseURL = currentBaseURL;

  if (!config.params) config.params = {};
  if (currentBaseURL.length) {
    if (
      currentBaseURL[0] !== '/' &&
      !process.env.IS_ELECTRON &&
      getCookie('MUSIC_U') !== null
    ) {
      config.params.cookie = `MUSIC_U=${getCookie('MUSIC_U')};`;
    }
  } else {
    console.error("You must set up the baseURL in the service's config");
  }

  if (!process.env.IS_ELECTRON && !config.url.includes('/login')) {
    config.params.realIP = '211.161.244.70';
  }

  // Force real_ip
  try {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const enableRealIP = settings.enableRealIP;
    const realIP = settings.realIP;
    if (process.env.VUE_APP_REAL_IP) {
      config.params.realIP = process.env.VUE_APP_REAL_IP;
    } else if (enableRealIP && realIP) {
      config.params.realIP = realIP;
    }

    const proxy = settings.proxyConfig;
    if (proxy && ['HTTP', 'HTTPS'].includes(proxy.protocol)) {
      config.params.proxy = `${proxy.protocol}://${proxy.server}:${proxy.port}`;
    }
  } catch (e) {
    console.warn(
      'Failed to parse settings from localStorage in request interceptor',
      e
    );
  }

  return config;
});

service.interceptors.response.use(
  response => {
    const res = response.data;
    // 连接成功，重置失败标志
    if (apiConnectionFailedFlag) {
      resetApiConnectionFailedFlag();
    }
    return res;
  },
  async error => {
    /** @type {import('axios').AxiosResponse | null} */
    let response;
    let data;
    if (error === 'TypeError: baseURL is undefined') {
      response = error;
      data = error;
      console.error("You must set up the baseURL in the service's config");
    } else if (error.response) {
      response = error.response;
      data = response.data;
    }

    // 检测 API 连接失败
    checkApiConnectionFailed(error);

    if (
      response &&
      typeof data === 'object' &&
      data.code === 301 &&
      data.msg === '需要登录'
    ) {
      console.warn('Token has expired. Logout now!');

      // 登出帳戶
      doLogout();

      // 導向登入頁面
      if (process.env.IS_ELECTRON === true) {
        router.push({ name: 'loginAccount' });
      } else {
        router.push({ name: 'login' });
      }
    }

    return Promise.reject(error);
  }
);

// API 连接失败检测标志（避免重复提示）
let apiConnectionFailedFlag = false;
let apiConnectionFailedTimer = null;

/**
 * 检测 API 连接失败并触发提示
 * 仅在非 Electron 模式下且未设置自定义 API URL 时提示
 */
function checkApiConnectionFailed(error) {
  // 仅在非 Electron 模式下检测
  if (process.env.IS_ELECTRON) {
    return;
  }

  // 如果已经提示过，不再重复提示
  if (apiConnectionFailedFlag) {
    return;
  }

  // 检查是否是网络连接错误
  const isNetworkError =
    !error.response &&
    (error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ETIMEDOUT' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout'));

  // 检查是否是服务器错误（5xx）或连接被拒绝
  const isServerError =
    error.response?.status >= 500 ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'EHOSTUNREACH';

  // 检查是否设置了自定义 API URL
  try {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    const hasCustomApiUrl =
      settings.customNeteaseApiUrl && settings.customNeteaseApiUrl.trim();

    // 如果已经设置了自定义 API URL，不提示（让用户自己测试）
    if (hasCustomApiUrl) {
      return;
    }
  } catch (e) {
    // 忽略解析错误
  }

  // 如果是网络错误或服务器错误，触发提示
  if (isNetworkError || isServerError) {
    apiConnectionFailedFlag = true;

    // 清除之前的定时器
    if (apiConnectionFailedTimer) {
      clearTimeout(apiConnectionFailedTimer);
    }

    // 延迟提示，避免在页面加载时立即弹出
    apiConnectionFailedTimer = setTimeout(() => {
      // 触发自定义事件，让 App.vue 监听并显示提示
      window.dispatchEvent(
        new CustomEvent('api-connection-failed', {
          detail: { error },
        })
      );
    }, 2000); // 延迟 2 秒，避免在页面刚加载时立即提示
  }
}

/**
 * 重置 API 连接失败标志（在设置页面测试成功后调用）
 */
function resetApiConnectionFailedFlag() {
  apiConnectionFailedFlag = false;
  if (apiConnectionFailedTimer) {
    clearTimeout(apiConnectionFailedTimer);
    apiConnectionFailedTimer = null;
  }
}

// 导出 getBaseURL 和 resetApiConnectionFailedFlag 函数，供外部使用
export { getBaseURL, resetApiConnectionFailedFlag };
export default service;
