<script setup lang="ts">
import { cloneDeep } from 'lodash';
import { computed, ref, watch, type Ref } from 'vue';
import { z } from 'zod';
import { RuntimeSchema } from '../../GSKO-BASE/schema/runtime';
import { UserSchema } from '../../GSKO-BASE/schema/user';
import { updateEraVariable } from '../utils/eraWriter';

type UserData = z.infer<typeof UserSchema>;

const props = defineProps<{
  detail: any;
}>();

const getDefaultUserData = (): UserData => ({
  姓名: '',
  身份: '',
  性别: '未知',
  年龄: '',
  特殊能力: '',
  所在地区: '',
  居住地区: '',
  重要经历: '',
  人际关系: '',
});

const userData: Ref<UserData> = ref(getDefaultUserData());
const otherGender = ref('');

// 从 props.detail 解析出 runtime 对象
const parsedRuntime = computed(() => {
  if (!props.detail || !props.detail.runtime) return null;
  const parseResult = RuntimeSchema.safeParse(props.detail.runtime);
  if (parseResult.success) {
    return parseResult.data;
  }
  console.error('CharacterProfile: 解析 runtime 数据失败', parseResult.error);
  return null;
});

// 从 runtime.area.legal_locations 提取地点列表
const legalLocations = computed(() => {
  const locations = parsedRuntime.value?.area?.legal_locations;
  if (!locations) return [];
  return locations.map(loc => loc.name).sort((a, b) => a.localeCompare(b, 'zh-Hans'));
});

watch(
  () => props.detail,
  newDetail => {
    if (newDetail && newDetail.statWithoutMeta && newDetail.statWithoutMeta.user) {
      const result = UserSchema.safeParse(newDetail.statWithoutMeta.user);
      if (result.success) {
        userData.value = { ...getDefaultUserData(), ...result.data };
        // 处理“其他”性别
        const standardGenders = ['未知', '男', '女'];
        if (userData.value.性别 && !standardGenders.includes(userData.value.性别)) {
          otherGender.value = userData.value.性别;
          userData.value.性别 = '其他';
        }
      } else {
        console.error('【CharacterProfile】用户数据解析失败:', result.error);
        userData.value = getDefaultUserData();
      }
    }
  },
  { immediate: true, deep: true },
);

// ===== 填充示例 (重构后) =====
function fillDemo() {
  userData.value = {
    姓名: '{{user}}',
    身份: '外来者',
    性别: '未知',
    年龄: '18',
    所在地区: '博丽神社',
    居住地区: '博丽神社',
    人际关系: '暂无',
    特殊能力: '在地上行走程度的能力',
    重要经历: '因为未知的原因，来到了幻想乡',
  };
  otherGender.value = '';
}

// ===== 写入数据 (重构后) =====
async function writeUserToMVU() {
  const finalUserData = cloneDeep(userData.value);

  // 处理“其他”性别
  if (finalUserData.性别 === '其他') {
    finalUserData.性别 = otherGender.value.trim() || '未知';
  }

  const userObj = {
    姓名: finalUserData.姓名 || '主角',
    性别: finalUserData.性别 || '未知',
    年龄: finalUserData.年龄 ? String(finalUserData.年龄) : '未知',
    人际关系: finalUserData.人际关系 || '暂无',
    特殊能力: finalUserData.特殊能力 || '在地上行走程度的能力',
    身份: finalUserData.身份 || '外来者',
    所在地区: finalUserData.所在地区 || '博丽神社',
    居住地区: finalUserData.居住地区 || '未知',
    重要经历: finalUserData.重要经历 || '因为未知的原因，来到了幻想乡',
  };

  try {
    for (const [key, value] of Object.entries(userObj)) {
      updateEraVariable(`user.${key}`, value);
    }
    alert('角色数据已发送更新请求！');
  } catch (e) {
    alert('【开局/写回】异常：' + String(e));
  }
}
</script>

<template>
  <div class="card">
    <h2>角色档案</h2>
    <div class="grid-2 grid">
      <div>
        <label for="u_name">姓名</label>
        <input id="u_name" v-model="userData.姓名" type="text" placeholder="如：博丽某某" />
      </div>
      <div>
        <label for="u_identity">身份</label>
        <input id="u_identity" v-model="userData.身份" type="text" placeholder="如：外界来访者 / 里民 / 巫女见习" />
      </div>
      <div>
        <label>性别</label>
        <div class="row">
          <label class="inline"><input v-model="userData.性别" type="radio" name="u_gender" value="未知" /> 未知</label>
          <label class="inline"><input v-model="userData.性别" type="radio" name="u_gender" value="男" /> 男</label>
          <label class="inline"><input v-model="userData.性别" type="radio" name="u_gender" value="女" /> 女</label>
          <label class="inline"><input v-model="userData.性别" type="radio" name="u_gender" value="其他" /> 其他</label>
          <input v-if="userData.性别 === '其他'" v-model="otherGender" type="text" placeholder="选择“其他”时可填写" />
        </div>
      </div>
      <div>
        <label for="u_age">年龄</label>
        <input id="u_age" v-model="userData.年龄" type="text" placeholder="如：18 / 十七岁" />
      </div>
    </div>

    <div class="grid-2 grid">
      <div>
        <label for="u_home">居住地区</label>
        <select id="u_home" v-model="userData.居住地区">
          <option value="" disabled>— 请选择 —</option>
          <option v-for="place in legalLocations" :key="place" :value="place">{{ place }}</option>
        </select>
      </div>
      <div>
        <label for="u_current">所在地区</label>
        <select id="u_current" v-model="userData.所在地区">
          <option value="" disabled>— 请选择 —</option>
          <option v-for="place in legalLocations" :key="place" :value="place">{{ place }}</option>
        </select>
      </div>
    </div>

    <div class="grid">
      <div>
        <label for="u_relationships">人际关系</label>
        <input
          id="u_relationships"
          v-model="userData.人际关系"
          type="text"
          placeholder="如：与灵梦相识 / 与魔理沙偶遇"
        />
      </div>
      <div>
        <label for="u_ability">特殊能力</label>
        <input id="u_ability" v-model="userData.特殊能力" type="text" placeholder="如：在地上行走程度的能力" />
      </div>
      <div>
        <label for="u_notes">重要经历</label>
        <textarea id="u_notes" v-model="userData.重要经历" placeholder="因为未知的原因，来到了幻想乡"></textarea>
      </div>
    </div>

    <div class="btn-bar">
      <button @click="writeUserToMVU">将角色设置写入变量</button>
      <button class="muted-btn" @click="fillDemo">填充示例</button>
    </div>
  </div>
</template>
