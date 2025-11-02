/**
 * @file 角色分布（character-locations-processor）测试数据
 * 参考其它模块：导入基础测试数据，clone 后只改动需要的字段，确保必须类别齐全
 */
import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// 场景 1：主角与部分 NPC 同地，其他分散
export const charLocTest_Standard = _.merge(_.cloneDeep(baseTestData), {
  user: { 所在地区: '博丽神社' },
  chars: {
    reimu: { 所在地区: '博丽神社' },
    marisa: { 所在地区: '人间之里' },
    sakuya: { 所在地区: '红魔馆' },
    sanae: { 所在地区: '守矢神社' },
  },
});

// 场景 2：包含未知位置（空字符串）、null 位置
export const charLocTest_WithUnknowns = _.merge(_.cloneDeep(baseTestData), {
  user: { 所在地区: '' },
  chars: {
    reimu: { 所在地区: '' }, // 空字符串应归为“未知”
    marisa: { 所在地区: null }, // null 也视为未知
    sakuya: { 所在地区: '红魔馆' },
    sanae: { 所在地区: '人间之里' },
  },
});

// 场景 3：大部分 NPC 同地，用于分组规模测试
export const charLocTest_MostOnVillage = _.merge(_.cloneDeep(baseTestData), {
  user: { 所在地区: '人间之里' },
  chars: {
    reimu: { 所在地区: '人间之里' },
    marisa: { 所在地区: '人间之里' },
    sakuya: { 所在地区: '人间之里' },
    sanae: { 所在地区: '守矢神社' },
  },
});

