import { Logger } from '../utils/log';
import { setupSnapshotEmulator } from '../utils/snapshot-emulator';

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
  // 创建一个 <details> 元素作为可折叠的块
  const details = $('<details>').css({
    marginTop: '10px',
    borderTop: '1px solid #eee',
    paddingTop: '5px',
  });

  // 创建 <summary> 元素作为标题
  $('<summary>')
    .html(`<strong>${title}</strong>`)
    .css({
      cursor: 'pointer',
      userSelect: 'none',
    })
    .appendTo(details);

  // 创建一个容器来存放按钮
  const buttonContainer = $('<div>').css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '5px',
  });

  // 创建并添加按钮到容器中
  configs.forEach(config => {
    $('<button>')
      .text(config.text)
      .css(style)
      .on('click', async () => {
        logger.log('buttonClick', `触发测试: ${config.text}`);

        // 根据 payload 设置快照模拟器
        const cleanupEmulator = setupSnapshotEmulator(config.payload);

        if (config.beforeTest) {
          await config.beforeTest();
        }
        
        const eventType = config.eventType || 'dev:fakeWriteDone';
        // 确保在事件处理完后再清理模拟器
        try {
          await eventEmit(eventType, config.payload);
          toastr.success(`已发送测试事件: ${config.text}`);
        } finally {
          cleanupEmulator();
        }
      })
      .appendTo(buttonContainer);
  });

  // 将按钮容器添加到 <details> 元素中
  details.append(buttonContainer);

  // 将整个 <details> 块添加到主面板
  panel.append(details);
}
