/**
 * @description ERA 变量路径常量，用于统一管理通过 era:event 更新的变量路径。
 */
export const ERA_VARIABLE_PATH = {
  /**
   * 主内容区域的字号百分比。
   * 路径: config.ui.mainFontPercent
   */
  MAIN_FONT_PERCENT: 'config.ui.mainFontPercent',
  /**
   * 字号调整的步进值百分比。
   * 路径: config.ui.fontScaleStepPct
   */
  FONT_SCALE_STEP_PCT: 'config.ui.fontScaleStepPct',

  /**
   * UI 主题（'light' 或 'dark'）。
   * 路径: config.ui.theme
   */
  UI_THEME: 'config.ui.theme',

  /**
   * ASCII 世界地图的文本内容。
   * 路径: world.map_ascii
   */
  MAP_ASCII: 'world.map_ascii',

  /**
   * 世界地图的图谱数据（节点和边）。
   * 路径: world.map_graph
   */
  MAP_GRAPH: 'world.map_graph',

  /**
   * 当地区信息无效时的备用地点。
   * 路径: config.defaults.fallbackPlace
   */
  FALLBACK_PLACE: 'config.defaults.fallbackPlace',

  /**
   * 是否立即触发异变。
   * 路径: config.incident.immediate_trigger
   */
  INCIDENT_IMMEDIATE_TRIGGER: 'config.incident.immediate_trigger',

  /**
   * 是否乱序异变池。
   * 路径: config.incident.random_pool
   */
  INCIDENT_RANDOM_POOL: 'config.incident.random_pool',

  /**
   * runtime 对象在 chat 变量中的前缀。
   */
  RUNTIME_PREFIX: 'runtime.',

  /**
   * 异变冷却时间配置路径。
   * 路径: config.incident.cooldown
   */
  INCIDENT_COOLDOWN: 'config.incident.cooldown',

  /**
   * 世界时间进度。
   * 路径: 世界.timeProgress
   */
  TIME_PROGRESS: '世界.timeProgress',

  /**
   * 节日列表。
   * 路径: festivals_list
   */
  FESTIVALS_LIST: 'festivals_list',

  /**
   * 文文新闻正文。
   * 路径: 文文新闻
   */
  NEWS_TEXT: '文文新闻',

  /**
   * 附加正文。
   * 路径: 附加正文
   */
  EXTRA_MAIN: '附加正文',

  // ==================== 用户与角色 ====================
  /**
   * 用户所在地区。
   * 路径: user.所在地区
   */
  USER_LOCATION: 'user.所在地区',

  /**
   * 用户居住地区。
   * 路径: user.居住地区
   */
  USER_HOME: 'user.居住地区',

  /**
   * 角色集合。
   * 路径: chars
   */
  CHARS: 'chars',

  /**
   * 角色居住地区（单角色对象内的键名）。
   * 路径键: 居住地区
   */
  CHAR_HOME: '居住地区',

  /**
   * 角色所在地区。
   * 路径: 所在地区
   */
  CHAR_LOCATION: '所在地区',

  /**
   * 角色好感度。
   * 路径: 好感度
   */
  CHAR_AFFECTION: '好感度',

  /**
   * 用户数据。
   * 路径: user
   */
  USER_DATA: 'user',

  /**
   * 用户重要经历。
   * 路径: 重要经历
   */
  USER_EVENTS: '重要经历',

  /**
   * 用户人际关系。
   * 路径: 人际关系
   */
  USER_RELATIONSHIPS: '人际关系',

  // ==================== 其他角色工具条 ====================
  /**
   * 异变中退治者是否不拜访。
   * 路径: config.meetStuff.skipVisitHunters
   */
  SKIP_VISIT_HUNTERS: 'config.meetStuff.skipVisitHunters',

  /**
   * 异变中退治者是否不睡觉。
   * 路径: config.nightStuff.skipSleepHunters
   */
  SKIP_SLEEP_HUNTERS: 'config.nightStuff.skipSleepHunters',

  // ==================== UI/显示相关 ====================
  /**
   * 角色横幅滚动步长。
   * 路径: config.ui.ribbonStep
   */
  UI_RIBBON_STEP: 'config.ui.ribbonStep',

  // ==================== 好感配置 ====================
  /**
   * 好感阶段文案数组。
   * 路径: config.affection.affectionStages
   */
  AFFECTION_STAGES: 'config.affection.affectionStages',
  /**
   * 爱阈值。
   * 路径: config.affection.loveThreshold
   */
  AFFECTION_LOVE_THRESHOLD: 'config.affection.loveThreshold',
  /**
   * 恨阈值。
   * 路径: config.affection.hateThreshold
   */
  AFFECTION_HATE_THRESHOLD: 'config.affection.hateThreshold',

  // ==================== 根路径/前缀 ====================
  /**
   * 配置根。
   * 路径: config
   */
  CONFIG_ROOT: 'config',
};
