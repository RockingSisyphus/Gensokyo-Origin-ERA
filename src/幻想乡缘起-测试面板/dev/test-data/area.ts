/**
 * @file 用于测试 Area Processor 的数据
 */
import _ from 'lodash';
import baseTestData from '../stat-test-data.json';

// 测试场景 1: 用户位于一个已知的地区（博丽神社）
export const statUserAtKnownLocation = _.cloneDeep(baseTestData);

// 测试场景 2: 用户位于一个未知的地区
export const statUserAtUnknownLocation = _.merge(_.cloneDeep(baseTestData), {
  user: {
    所在地区: '外界',
  },
});

// 测试场景 3: stat 中没有用户位置信息
export const statUserLocationMissing = _.merge(_.cloneDeep(baseTestData), {
  user: {
    所在地区: undefined,
  },
});

// 测试场景 4: stat 中没有世界书信息
export const statWorldMissing = _.merge(_.cloneDeep(baseTestData), {
  world: undefined,
});

// === 路线计算测试场景 ===

// 场景 5: 从博丽神社出发，应能看到到人间之里和魔法之森的路线
export const statForRouteFromShrine = _.cloneDeep(baseTestData);

// 场景 6: 从永远亭出发，应能看到到迷途竹林的路线
export const statForRouteFromEientei = _.merge(_.cloneDeep(baseTestData), {
  user: {
    所在地区: '永远亭',
  },
});

// 场景 7: 从一个没有边的孤立点出发（如天界），不应有任何路线
export const statForRouteFromIsolated = _.merge(_.cloneDeep(baseTestData), {
  user: {
    所在地区: '秘封俱乐部',
  },
});
