import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// 确保默认基线中的红雾异变被标记为已结束，避免被视作正在进行中的异变。
if (baseTestData?.incidents?.['红雾异变']) {
  baseTestData.incidents['红雾异变'] = {
    ...baseTestData.incidents['红雾异变'],
    异变已结束: true,
  };
}

const createStat = (overrides: Record<string, unknown>) =>
  _.mergeWith(_.cloneDeep(baseTestData), overrides, (objValue, srcValue) => {
    if (Array.isArray(srcValue)) {
      return srcValue;
    }
    return undefined;
  });

export const incidentTestData = {
  // 所有情景都直接设定 cache，以便独立测试异变处理的各个分支。

  '冷却锚点初始化': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 180,
          forceTrigger: false,
          isRandomPool: false,
        },
      },
      世界: { timeProgress: 120 },
      incidents: {},
      cache: {
        incident: { incidentCooldownAnchor: null },
      },
    }),
  },

  '冷却期内保持日常': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 240,
          forceTrigger: false,
          isRandomPool: false,
        },
      },
      世界: { timeProgress: 180 }, // 仍处于冷却期
      incidents: {},
      cache: {
        incident: { incidentCooldownAnchor: 60 },
      },
    }),
  },

  '冷却结束触发预设异变': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 90,
          forceTrigger: false,
          isRandomPool: false,
          pool: [{ name: '星光逆流异变', detail: '夜空的星光在白昼逆流而下，幻象扭曲。', mainLoc: ['无名丘'] }],
        },
      },
      世界: { timeProgress: 200 }, // 200 - 80 > 90
      incidents: {},
      cache: {
        incident: { incidentCooldownAnchor: 80 },
      },
    }),
  },

  '冷却结束触发随机异变': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 60,
          forceTrigger: false,
          isRandomPool: true,
          pool: [],
          randomCore: ['梦境'],
          randomType: ['偏移'],
        },
      },
      世界: { timeProgress: 200 }, // 200 - 120 > 60
      incidents: {},
      cache: {
        incident: { incidentCooldownAnchor: 120 },
      },
    }),
  },

  '随机池-多候选触发': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 45,
          forceTrigger: false,
          isRandomPool: true,
          pool: [
            { name: '梦境余响异变', detail: '人们的梦境在白昼回荡，现实被扭曲。', mainLoc: ['梦境之里'] },
            { name: '影子共鸣异变', detail: '影子失控地移动，与本体产生共鸣噪音。', mainLoc: ['无名丘', '竹林'] },
          ],
          randomCore: ['影子'],
          randomType: ['共鸣'],
        },
      },
      世界: { timeProgress: 300 }, // 300 - 200 > 45
      incidents: {},
      cache: {
        incident: { incidentCooldownAnchor: 200 },
      },
    }),
  },

  '随机池-排除历史后触发': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 80,
          forceTrigger: false,
          isRandomPool: true,
          pool: [
            { name: '梦境余响异变', detail: '梦境残响尚未散去。', mainLoc: ['梦境之里'] },
            { name: '星辉倒影异变', detail: '星辉倒映在湖面，时间被拖慢。', mainLoc: ['雾之湖'] },
          ],
          randomCore: ['星辉'],
          randomType: ['倒影'],
        },
      },
      世界: { timeProgress: 410 }, // 410 - 300 > 80
      incidents: {
        梦境余响异变: {
          异变已结束: true,
          异变细节: '梦境余响被巫女镇压。', // 保留历史记录以验证过滤
          主要地区: ['梦境之里'],
          异变退治者: ['博丽灵梦'],
        },
      },
      cache: {
        incident: { incidentCooldownAnchor: 300 },
      },
    }),
  },

  '强制触发忽略冷却': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 300,
          forceTrigger: true,
          isRandomPool: false,
          pool: [{ name: '春雪异变', detail: '春天到了但鹅毛大雪仍在飘落。', mainLoc: ['白玉楼'] }],
        },
      },
      世界: { timeProgress: 260 }, // 未到冷却，但强制触发
      incidents: {},
      cache: {
        incident: { incidentCooldownAnchor: 200 },
      },
    }),
  },

  '正在进行的异变': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 180,
          forceTrigger: false,
          isRandomPool: false,
          pool: [
            { name: '红雾异变', detail: '红雾仍在蔓延，调查暂未结束。', mainLoc: ['红魔馆', '雾之湖'] },
          ],
        },
      },
      世界: { timeProgress: 420 },
      incidents: {
        红雾异变: {
          异变已结束: false,
          异变细节: '红色的雾气覆盖了整个天空。',
          主要地区: ['红魔馆', '雾之湖'],
          异变退治者: ['博丽灵梦'],
        },
      },
      cache: {
        incident: { incidentCooldownAnchor: null },
      },
    }),
  },

  '历史异变后重新冷却': {
    stat: createStat({
      config: {
        incident: {
          cooldownMinutes: 120,
          forceTrigger: false,
          isRandomPool: false,
          pool: [{ name: '花映冢异变', detail: '花海异动蔓延至人间之里。', mainLoc: ['人间之里'] }],
        },
      },
      世界: { timeProgress: 540 },
      incidents: {
        红雾异变: {
          异变已结束: true,
          异变细节: '红雾已经散去，只剩些许余韵。',
          主要地区: ['红魔馆'],
          异变退治者: ['博丽灵梦', '雾雨魔理沙'],
        },
        春雪异变: {
          异变已结束: true,
          异变细节: '春雪停歇，幻想乡恢复常态。',
          主要地区: ['白玉楼'],
          异变退治者: ['魂魄妖梦'],
        },
      },
      cache: {
        incident: { incidentCooldownAnchor: null },
      },
    }),
  },
};
