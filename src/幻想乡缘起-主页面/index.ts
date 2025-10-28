import { createApp } from 'vue';
// eslint-disable-next-line import-x/default
import App from './app.vue';
import './style.scss';
import { ERA_VARIABLE_PATH } from './utils/constants';
import { get } from './utils/format';
import { Logger, logContext } from './utils/log';

// ===============================================================
// 应用入口：挂载 Vue，并在 era:writeDone 事件中驱动整套 UI/后台流水线
// - 以此文件作为整个「幻想乡缘起-主页面」的调用起点
// - 在事件入口设置 logContext.mk，贯穿单次处理的日志上下文
// - 对每个组件与后台模块增加入口/出口日志与必要的告警
// ===============================================================
$(() => {
  const app = createApp(App);
  const appInstance = app.mount('#app');
  // 将 Vue app 实例挂载到 window 对象上，以便在其他地方访问（调试/外部调用）
  (window as any).vueApp = appInstance;

  const logger = new Logger();

  // 监听 GSKO:showUI 事件，这是驱动 UI 更新的新入口
  eventOn('GSKO:showUI', (detail: any) => {
    const funcName = 'onShowUI';
    // 设定日志上下文（如消息键），便于跨模块串联同一轮处理
    try {
      logContext.mk = String(detail?.mk || '');
    } catch {
      logContext.mk = '';
    }

    logger.log(funcName, '接收到 GSKO:showUI 事件', detail);

    // 如果是由 apiWrite 触发的，则跳过，避免循环
    if (detail?.actions?.apiWrite === true) {
      logger.log(funcName, '检测到 apiWrite 触发的事件，已跳过。');
      return;
    }

    logger.debug(funcName, 'GSKO:showUI 事件的完整参数：', detail);

    try {
      const { statWithoutMeta, runtime } = detail || {};

      if (!statWithoutMeta) {
        logger.warn(funcName, '事件中未找到 statWithoutMeta，无法更新 UI。');
        return;
      }
      if (!runtime) {
        logger.warn(funcName, '事件中未找到 runtime 对象，流程可能出错。');
        // 注意：这里暂不中断，因为某些组件可能不依赖 runtime
      }

      const context = { statWithoutMeta, runtime };
      logger.debug(funcName, '创建的上下文对象:', context);
      // 从事件数据中安全地提取所需信息
      const userData = get(statWithoutMeta, ERA_VARIABLE_PATH.USER_DATA, {});
      logger.debug(funcName, '提取到的 userData:', userData);

      // 获取 Vue 组件实例的引用
      const { themeToggle, userState, statusBanner, ayaNews, statusTabContent, roleRibbon } = appInstance as any;

      // 调用主题切换组件的更新函数
      try {
        if (themeToggle && typeof themeToggle.updateTheme === 'function') {
          logger.debug(funcName, '调用 ThemeToggle.updateTheme 入口');
          themeToggle.updateTheme(context);
          logger.debug(funcName, 'ThemeToggle.updateTheme 退出');
        } else {
          logger.warn(funcName, 'ThemeToggle 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'ThemeToggle.updateTheme 执行失败（非致命）。', e);
      }

      // 调用用户侧边栏组件的更新函数
      try {
        if (userState && typeof userState.updateUserStatus === 'function') {
          logger.debug(funcName, '调用 UserState.updateUserStatus 入口');
          // userState 仅需 userData，从 statWithoutMeta 中提取
          userState.updateUserStatus(userData);
          logger.debug(funcName, 'UserState.updateUserStatus 退出');
        } else {
          logger.warn(funcName, 'UserState 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'UserState.updateUserStatus 执行失败（非致命）。', e);
      }

      // 调用状态横幅组件的更新函数
      try {
        if (statusBanner && typeof statusBanner.update === 'function') {
          logger.debug(funcName, '调用 StatusBanner.update 入口');
          statusBanner.update(context);
          logger.debug(funcName, 'StatusBanner.update 退出');
        } else {
          logger.warn(funcName, 'StatusBanner 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'StatusBanner.update 执行失败（非致命）。', e);
      }

      // 调用新闻组件的更新函数 (如果存在)
      try {
        if (ayaNews && typeof ayaNews.updateNews === 'function') {
          logger.debug(funcName, '调用 AyaNews.updateNews 入口');
          ayaNews.updateNews(context);
          logger.debug(funcName, 'AyaNews.updateNews 退出');
        } else {
          logger.warn(funcName, 'AyaNews 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'AyaNews.updateNews 执行失败（非致命）。', e);
      }

      // [重构] 调用新的 StatusTabContent 组件的更新函数，由它负责更新其所有子组件
      try {
        if (statusTabContent && typeof statusTabContent.update === 'function') {
          logger.log(funcName, '正在调用 StatusTabContent.update...');
          statusTabContent.update(context);
          logger.debug(funcName, 'StatusTabContent.update 调用完成');
        } else {
          logger.warn(funcName, 'StatusTabContent 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'StatusTabContent.update 执行失败（非致命）。', e);
      }

      // 新增：调用 RoleRibbon 组件的更新函数，由它根据 statWithoutMeta 渲染同区角色并绑定箭头
      try {
        if (roleRibbon && typeof roleRibbon.updateRibbon === 'function') {
          logger.log(funcName, '正在调用 RoleRibbon.updateRibbon...');
          roleRibbon.updateRibbon(context);
          logger.debug(funcName, 'RoleRibbon.updateRibbon 调用完成');
        } else {
          logger.warn(funcName, 'RoleRibbon 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'RoleRibbon.updateRibbon 执行失败（非致命）。', e);
      }

      // [已移除] 旧的好感度处理逻辑已迁移到 Vue 组件内部
    } catch (e) {
      logger.error(funcName, 'GSKO:showUI 处理过程出现未捕获异常', e);
    } finally {
      // 清理上下文，避免影响后续事件
      logContext.mk = '';
    }
  });
});
