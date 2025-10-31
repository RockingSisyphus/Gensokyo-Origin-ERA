import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

export const standardAffectionLevel = _.merge(_.cloneDeep(baseTestData), {
  chars: {
    reimu: {
      好感度: 30,
    },
    marisa: {
      好感度: 75,
    },
    sakuya: {
      好感度: -50,
    },
    noAffectionChar: {
      name: '无好感度角色',
    },
  },
});

const missingConfigBase = _.cloneDeep(baseTestData);
delete (missingConfigBase as any).config;
export const missingConfig = _.merge(missingConfigBase, {
  chars: {
    reimu: {
      好感度: 30,
    },
  },
});

export const emptyStages = _.merge(_.cloneDeep(baseTestData), {
  config: {
    affection: {
      affectionStages: [],
    },
  },
  chars: {
    reimu: {
      好感度: 30,
    },
  },
});
