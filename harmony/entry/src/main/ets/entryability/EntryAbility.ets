import UIAbility from '@ohos.app.ability.UIAbility';
import hilog from '@ohos.hilog';
import window from '@ohos.window';
import deviceInfo from '@ohos.deviceInfo';

/**
 * 应用入口 Ability，负责管理应用的生命周期
 */
export default class EntryAbility extends UIAbility {
  /**
   * Ability 创建时调用
   */
  onCreate() {
    hilog.info(0x0000, 'testTag', '%{public}s', 'EntryAbility onCreate');
  }

  /**
   * Ability 销毁时调用
   */
  onDestroy() {
    hilog.info(0x0000, 'testTag', '%{public}s', 'EntryAbility onDestroy');
  }

  /**
   * 窗口舞台创建时调用
   * @param windowStage 窗口舞台对象
   */
  onWindowStageCreate(windowStage: window.WindowStage) {
    hilog.info(0x0000, 'testTag', '%{public}s', 'EntryAbility onWindowStageCreate');

    try {
      const mainWindow = windowStage.getMainWindowSync()
      if (deviceInfo.deviceType != "phone") {
        mainWindow.setPreferredOrientation(window.Orientation.LANDSCAPE)
          .catch(() => {
            hilog.error(0x0000, "testTag", "无法设置窗口方向")
          });
        mainWindow.setWindowLayoutFullScreen(true)
          .catch(() => {
            hilog.error(0x0000, "testTag", "无法设置全屏")
          })
      }
    } catch (error) {
      hilog.error(0x0000, "testTag", error)
    }
    
    // 加载主页面
    windowStage.loadContent('index', (err, data) => {
      if (err.code) {
        hilog.error(0x0000, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err) ?? '');
        return;
      }
      hilog.info(0x0000, 'testTag', 'Succeeded in loading the content. Data: %{public}s', JSON.stringify(data) ?? '');
    });
  }

  /**
   * 前台获得焦点时调用
   */
  onForeground() {
    hilog.info(0x0000, 'testTag', '%{public}s', 'EntryAbility onForeground');
  }

  /**
   * 后台失去焦点时调用
   */
  onBackground() {
    hilog.info(0x0000, 'testTag', '%{public}s', 'EntryAbility onBackground');
  }
}
