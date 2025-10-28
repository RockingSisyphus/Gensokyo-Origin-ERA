import { Logger } from '../utils/log';

const logger = new Logger();

export interface TestButtonConfig {
  text: string;
  payload: any;
  eventType?: string;
  beforeTest?: () => Promise<any>;
}

/**
 * 向测试面板添加一组测试按钮的通用函数。
 * @param panel - 要添加按钮的 jQuery 面板对象。
 * @param title - 按钮组的标题。
 * @param configs - 按钮配置数组。
 * @param style - 按钮的 CSS 样式。
 */
export function addTestButtons(
  panel: JQuery,
  title: string,
  configs: TestButtonConfig[],
  style: Record<string, string | number>,
) {
  // 添加标题
  $('<div>')
    .html(`<strong>${title}</strong>`)
    .css({
      marginTop: '10px',
      borderTop: '1px solid #eee',
      paddingTop: '5px',
    })
    .appendTo(panel);

  // 创建并添加按钮
  configs.forEach(config => {
    $('<button>')
      .text(config.text)
      .css(style)
      .on('click', async () => {
        logger.log('buttonClick', `触发测试: ${config.text}`);
        if (config.beforeTest) {
          await config.beforeTest();
        }
        const eventType = config.eventType || 'dev:fakeWriteDone';
        eventEmit(eventType, config.payload);
        toastr.success(`已发送测试事件: ${config.text}`);
      })
      .appendTo(panel);
  });
}
