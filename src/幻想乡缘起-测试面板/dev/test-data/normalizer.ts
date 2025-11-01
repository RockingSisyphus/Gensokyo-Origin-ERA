/**
 * @file 用于测试 Normalizer 模块的数据
 */
import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// 返回一份深拷贝的基础测试数据，防止交叉污染
const getClonedBaseData = () => _.cloneDeep(baseTestData);

// 测试场景 1: 用户和角色的地区名称包含别名或非法名称
export const statWithIllegalLocations = _.merge(getClonedBaseData(), {
  user: {
    // 使用别名
    居住地区: '人里',
    // 使用非法地区
    所在地区: '火星',
  },
  chars: {
    // marisa: 使用别名
    marisa: {
      居住地区: '雾雨店', // 别名
      所在地区: '魔法森林', // 别名
    },
    // sanae: 居住地区非法，所在地区为空
    sanae: {
      居住地区: '幻想乡', // 非法地区
      所在地区: '', // 空地区
    },
    // 新增一个角色，两个地区都非法
    flandre: {
      name: '芙兰朵露·斯卡雷特',
      居住地区: '红魔馆地下室',
      所在地区: '玩耍中',
    },
  },
});

// 测试场景 2: 用户和部分角色的地区信息完全缺失
export const statWithMissingLocations = (() => {
  const stat = getClonedBaseData();
  // @ts-expect-error: for testing purpose
  delete stat.user.居住地区;
  // @ts-expect-error: for testing purpose
  delete stat.user.所在地区;
  // @ts-expect-error: for testing purpose
  delete stat.chars.marisa.居住地区;
  // @ts-expect-error: for testing purpose
  delete stat.chars.marisa.所在地区;
  return stat;
})();
