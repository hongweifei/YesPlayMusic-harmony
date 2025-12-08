import web_webview from '@ohos.web.webview';
import hilog from '@ohos.hilog';

/**
 * 首页组件，包含ArkWeb组件用于加载本地网页资源
 */
@Entry
@Component
struct Index {
  @State message: Resource | string = $r("app.string.title");
  private webController: web_webview.WebviewController = new web_webview.WebviewController();

  onBackPress(): boolean | void {
    try {
      this.webController.backward();
      return true;
    } catch (error) {
      hilog.error(0x0000, "index", "返回上一页失败", error)
      return false;
    }
  }
  
  /**
   * 构建页面内容
   */
  build() {
    Column() {
      // 标题栏
      // Text(this.message)
      //   .fontSize(24)
      //   .fontWeight(FontWeight.Bold)
      //   .fontColor(Color.White)
      //   .width('100%')
      //   .textAlign(TextAlign.Center)
      //   .padding({ top: 12, bottom: 12 })
      //   .backgroundColor('#317ef3')

      // ArkWeb组件 - 加载本地HTML资源
      // 使用 $rawfile 语法引用rawfile目录下的资源
      Web({
        src: $rawfile('index.html'),
        controller: this.webController
      })
        .width('100%')
        .height('100%')
        .backgroundColor('#F5F5F5')
        // 配置WebView参数
        .zoomAccess(false) // 禁止缩放
        .darkMode(WebDarkMode.Auto) // 深色模式自动跟随
        .domStorageAccess(true) // 启用DOM存储访问
        .javaScriptAccess(true) // 启用JavaScript访问
        .mixedMode(MixedMode.All) // 允许加载HTTP和HTTPS混合内容
        .cacheMode(CacheMode.Default) // 使用默认缓存模式
        .fileAccess(true) // 启用文件访问
        .imageAccess(true) // 启用图片访问
        .onlineImageAccess(true) // 启用在线图片访问
        .geolocationAccess(true)
        // 页面事件监听
        .onPageBegin(() => {
          hilog.info(0x0000, 'Index', 'Page begin loading');
          
        })
        .onPageEnd(() => {
          hilog.info(0x0000, 'Index', 'Page finish loading');
        })
        .onProgressChange((event) => {
          hilog.info(0x0000, 'Index', 'Loading progress: %{public}d', event.newProgress);
        })
        .onErrorReceive((event) => {
          hilog.error(0x0000, 'Index', 'Page error: %{public}s', JSON.stringify(event.error));
        })
    }
    .width('100%')
    .height('100%')
  }
}
