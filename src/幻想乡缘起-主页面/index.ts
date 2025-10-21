import { createApp } from 'vue';
// eslint-disable-next-line import-x/default
import App from './app.vue';
import './style.scss';
import { ERA_VARIABLE_PATH } from './utils/constants';
import { Logger, logContext } from './utils/logger';
import { get } from './utils/mvu';

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

  const logger = new Logger('index');

  // 监听 ERA 框架的写入完成事件，这是驱动 UI 更新的新入口
  eventOn('Test:writeDone', (detail: any) => {
    const funcName = 'onTestWriteDone';
    // 设定日志上下文（如消息键），便于跨模块串联同一轮处理
    try {
      logContext.mk = String(detail?.mk || '');
    } catch {
      logContext.mk = '';
    }

    logger.log(funcName, '接收到 Test:writeDone 事件', {
      mk: detail?.mk,
      message_id: detail?.message_id,
      actions: detail?.actions,
      selectedMks: detail?.selectedMks,
      editLogs: detail?.editLogs,
      stat: detail?.stat,
      statWithoutMeta: detail?.statWithoutMeta,
      consecutiveProcessingCount: detail?.consecutiveProcessingCount,
    });

    // 如果是由 apiWrite 触发的，则跳过，避免循环
    if (detail?.actions?.apiWrite === true) {
      logger.log(funcName, '检测到 apiWrite 触发的事件，已跳过。');
      return;
    }

    logger.debug(funcName, 'Test:writeDone 事件的完整参数：', detail);

    try {
      const { statWithoutMeta } = detail || {};

      if (!statWithoutMeta) {
        logger.warn(funcName, '事件中未找到 statWithoutMeta，无法更新 UI。');
        return;
      }
      logger.debug(funcName, '提取到的 statWithoutMeta:', statWithoutMeta);
      // 从事件数据中安全地提取所需信息
      const userData = get(statWithoutMeta, ERA_VARIABLE_PATH.USER_DATA, {});
      logger.debug(funcName, '提取到的 userData:', userData);

      // 获取 Vue 组件实例的引用
      const { themeToggle, statusSidebar, statusBanner, statusNews, statusTabContent, roleRibbon } = appInstance as any;

      // 调用主题切换组件的更新函数
      try {
        if (themeToggle && typeof themeToggle.updateTheme === 'function') {
          logger.debug(funcName, '调用 ThemeToggle.updateTheme 入口');
          themeToggle.updateTheme(statWithoutMeta);
          logger.debug(funcName, 'ThemeToggle.updateTheme 退出');
        } else {
          logger.warn(funcName, 'ThemeToggle 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'ThemeToggle.updateTheme 执行失败（非致命）。', e);
      }

      // 调用用户侧边栏组件的更新函数
      try {
        if (statusSidebar && typeof statusSidebar.updateUserStatus === 'function') {
          logger.debug(funcName, '调用 StatusSidebar.updateUserStatus 入口');
          statusSidebar.updateUserStatus(userData);
          logger.debug(funcName, 'StatusSidebar.updateUserStatus 退出');
        } else {
          logger.warn(funcName, 'StatusSidebar 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'StatusSidebar.updateUserStatus 执行失败（非致命）。', e);
      }

      // 调用状态横幅组件的更新函数
      try {
        if (statusBanner && typeof statusBanner.update === 'function') {
          logger.debug(funcName, '调用 StatusBanner.update 入口');
          statusBanner.update(statWithoutMeta);
          logger.debug(funcName, 'StatusBanner.update 退出');
        } else {
          logger.warn(funcName, 'StatusBanner 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'StatusBanner.update 执行失败（非致命）。', e);
      }

      // 调用新闻组件的更新函数 (如果存在)
      try {
        if (statusNews && typeof statusNews.updateNews === 'function') {
          logger.debug(funcName, '调用 StatusNews.updateNews 入口');
          // 传入完整状态对象，组件内部自行从 '文文新闻' 路径读取
          statusNews.updateNews(statWithoutMeta);
          logger.debug(funcName, 'StatusNews.updateNews 退出');
        } else {
          logger.warn(funcName, 'StatusNews 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'StatusNews.updateNews 执行失败（非致命）。', e);
      }

      // [重构] 调用新的 StatusTabContent 组件的更新函数，由它负责更新其所有子组件
      try {
        if (statusTabContent && typeof statusTabContent.update === 'function') {
          logger.log(funcName, '正在调用 StatusTabContent.update...');
          statusTabContent.update(statWithoutMeta);
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
          roleRibbon.updateRibbon(statWithoutMeta);
          logger.debug(funcName, 'RoleRibbon.updateRibbon 调用完成');
        } else {
          logger.warn(funcName, 'RoleRibbon 组件缺失或接口不可用。');
        }
      } catch (e) {
        logger.warn(funcName, 'RoleRibbon.updateRibbon 执行失败（非致命）。', e);
      }

      // ===== 后台：地图图谱加载 + 位置合法化（从 index.ts 抽离到 backend/mapLocation.ts）=====
      // 按“FontSizeControls.vue 的方式”在 era:writeDone 时基于传入的 statWithoutMeta 驱动。
      // 说明：
      // - 原先从世界书读取 config 的部分，改为从本事件的 statWithoutMeta 中读取；
      // - 原先写入世界书/变量的部分，通过 eraWriter.updateEraVariable 写入；
      // - 原先访问 window.xxx 的 runtime，统一改为 utils/runtime 提供的 getRuntimeVar/setRuntimeVar（如后续需要）。
      // try {
      //   logger.log(funcName, '准备执行后台流水线：地图图谱加载 + 位置合法化');
      //   // 动态导入，避免首次加载阻塞渲染
      //   import('./backend/mapLocation')
      //     .then(mod => mod?.runMapAndLocationPipeline?.(statWithoutMeta))
      //     .then(() => logger.log(funcName, '后台流水线执行完成。'))
      //     .catch(e => logger.warn(funcName, '后台流水线执行异常（非致命）。', e));
      // } catch (e) {
      //   logger.warn(funcName, '后台流水线调度异常（已忽略）。', e);
      // }

      // ===== 新增：好感等级计算 + 进度条着色（从 index.ts 抽离到 backend/affection.ts）=====
      try {
        logger.log(funcName, '准备执行后台流水线：好感等级 + 进度条着色');
        import('./backend/affection')
          .then(mod => mod?.runAffectionPipeline?.(statWithoutMeta))
          .then(() => logger.log(funcName, '好感流水线执行完成。'))
          .catch(e => logger.warn(funcName, '好感流水线执行异常（非致命）。', e));
      } catch (e) {
        logger.warn(funcName, '好感流水线调度异常（已忽略）。', e);
      }
    } catch (e) {
      logger.error(funcName, 'Test:writeDone 处理过程出现未捕获异常', e);
    } finally {
      // 清理上下文，避免影响后续事件
      logContext.mk = '';
    }
  });
});
