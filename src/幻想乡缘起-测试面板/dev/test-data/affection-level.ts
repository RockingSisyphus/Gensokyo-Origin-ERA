export const standardAffectionLevel = {
  config: {
    affection: {
      affectionStages: [
        '[-99999,"死敌"]',
        '[-100,"憎恨"]',
        '[-20,"厌恶"]',
        '[0,"陌生"]',
        '[10,"普通"]',
        '[20,"熟悉"]',
        '[40,"亲近"]',
        '[70,"亲密"]',
        '[100,"思慕"]',
        '[99999,"不渝"]',
      ],
    },
  },
  chars: {
    博丽灵梦: {
      好感度: 30,
    },
    雾雨魔理沙: {
      好感度: 75,
    },
    十六夜咲夜: {
      好感度: -50,
    },
    无好感度角色: {},
  },
};

export const missingConfig = {
  chars: {
    博丽灵梦: {
      好感度: 30,
    },
  },
};

export const emptyStages = {
  config: {
    affection: {
      affectionStages: [],
    },
  },
  chars: {
    博丽灵梦: {
      好感度: 30,
    },
  },
};
