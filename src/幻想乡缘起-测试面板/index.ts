/**
 * @file 幻想乡缘起 - 测试面板入口
 * @description 这是一个独立的脚本，用于在开发环境中加载测试面板。
 */

import { initDevPanel, cleanupDevPanel } from './dev/panel';
import { Logger } from './utils/log';

const logger = new Logger();

$(() => {
  logger.log('main', '测试面板脚本加载');
  initDevPanel();

  $(window).on('pagehide.testpanel', () => {
    logger.log('main', '测试面板脚本卸载');
    cleanupDevPanel();
    $(window).off('.testpanel');
  });
});
