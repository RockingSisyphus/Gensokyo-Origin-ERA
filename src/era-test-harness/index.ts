import { standardData, missingData, boundaryData } from './test-data';

$(() => {
  // 创建悬浮面板
  const panel = $('<div>')
    .attr('id', 'demo-era-test-harness')
    .css({
      position: 'fixed',
      top: '10px',
      left: '10px',
      zIndex: 9999,
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    })
    .appendTo($('body'));

  // 创建标题
  $('<div><strong>UI 测试工具</strong></div>')
    .css({
      marginBottom: '5px',
      borderBottom: '1px solid #eee',
      paddingBottom: '5px',
    })
    .appendTo(panel);

  // 定义按钮
  const buttons = [
    { text: '发送“标准”数据', data: standardData },
    { text: '发送“缺失”数据', data: missingData },
    { text: '发送“边界”数据', data: boundaryData },
  ];

  // 创建并添加按钮到面板
  buttons.forEach(btnInfo => {
    $('<button>')
      .text(btnInfo.text)
      .css({
        cursor: 'pointer',
        padding: '8px 12px',
        border: '1px solid #ddd',
        background: '#f0f0f0',
        borderRadius: '4px',
      })
      .on('click', () => {
        console.log(`[Test Harness] 发送事件 Test:writeDone，场景: ${btnInfo.text}`);
        // 使用酒馆助手 API 触发自定义事件
        eventEmit('Test:writeDone', {
          statWithoutMeta: btnInfo.data,
        });
        toastr.success(`已发送测试事件：${btnInfo.text}`);
      })
      .appendTo(panel);
  });

  toastr.info('ERA 测试工具已加载。');

  $(window).on('pagehide', function () {
    $('body').find('[id^="demo-"]').remove();
  });
});
