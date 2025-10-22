var __webpack_exports__ = {};

const standardData = {
  config: {
    ui: {
      theme: "dark",
      mainFontPercent: 110,
      fontScaleStepPct: 10,
      ribbonStep: 300
    },
    defaults: {
      fallbackPlace: "博丽神社"
    },
    incident: {
      cooldown: 120,
      immediate_trigger: false,
      random_pool: true
    },
    meetStuff: {
      skipVisitHunters: false
    },
    nightStuff: {
      skipSleepHunters: false
    },
    affection: {
      affectionStages: [ [ -999, "死敌" ], [ -100, "憎恨" ], [ -50, "厌恶" ], [ 0, "不喜" ], [ 20, "冷淡" ], [ 50, "熟悉" ], [ 80, "亲近" ], [ 100, "思慕" ], [ 999, "不渝" ] ],
      loveThreshold: 100,
      hateThreshold: -100
    }
  },
  user: {
    姓名: "玩家",
    身份: "外来者",
    性别: "男",
    年龄: 20,
    特殊能力: "适应环境",
    所在地区: "博丽神社",
    居住地区: "人间之里",
    重要经历: [ "解决了红雾异变", "参加了宴会" ],
    人际关系: "与博丽灵梦是朋友关系。\n与雾雨魔理沙是竞争对手。"
  },
  chars: {
    博丽灵梦: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: 85,
      年龄: 18,
      身份: "巫女"
    },
    西瓜: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: 200,
      年龄: 18,
      身份: "吃货"
    },
    秦心: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: -200,
      年龄: 18,
      身份: "扫货"
    },
    路人: {
      所在地区: "博丽神社",
      居住地区: "博丽神社",
      好感度: -30,
      年龄: 18,
      身份: "1货"
    },
    雾雨魔理沙: {
      所在地区: "魔法森林",
      居住地区: "魔法森林",
      好感度: 110,
      年龄: 17,
      身份: "魔法使"
    },
    琪露诺: {
      所在地区: "雾之湖",
      居住地区: "雾之湖",
      好感度: -120,
      年龄: "不明",
      身份: "妖精"
    }
  },
  world: {
    map_ascii: " [博丽神社] -- [魔法之森]\n      | \n [雾之湖]",
    map_graph: {
      tree: {
        幻想乡及周边: {
          幻想乡本土: {
            东境丘陵带: [ "博丽神社" ],
            魔法之森带: [ "魔法之森" ],
            西境水域带: [ "雾之湖" ]
          }
        }
      },
      edges: [ {
        a: "博丽神社",
        b: "魔法之森"
      }, {
        a: "博丽神社",
        b: "雾之湖"
      } ]
    }
  },
  festivals_list: [ {
    month: 1,
    start_day: 1,
    end_day: 3,
    name: "正月（三天）",
    type: "seasonal_festival",
    customs: [ "到神社或寺院初诣参拜、抽签与写绘马，常见于博丽神社与命莲寺", "食用御节料理与年杂煮，门口挂注连绳、摆门松与镜饼", "发压岁钱与寄新年贺卡，迎接新年第一道日出" ],
    importance: 5,
    主办地: "博丽神社"
  }, {
    month: 1,
    start_day: 13,
    end_day: 13,
    name: "成人日（成人式）",
    type: "national_holiday",
    customs: [ "新成人举行典礼与祈福，常着和服前往神社参拜", "家庭与同辈聚会合影留念" ],
    importance: 3,
    主办地: "人间之里"
  }, {
    month: 1,
    start_day: 24,
    end_day: 25,
    name: "莺替神事",
    type: "matsuri",
    customs: [ "巫女吹响笛子呼唤莺群，举行莺替祭事", "现在聚到这里的并不是普通的鸴，而是天神的使者。这些鸴会啄去你说过的谎言。将其转换成幸福，它们会聚集在撒了谎的人身上。" ],
    importance: 2,
    主办地: "博丽神社"
  }, {
    month: 2,
    start_day: 3,
    end_day: 3,
    name: "节分",
    type: "seasonal_festival",
    customs: [ "撒豆驱鬼，高喊“鬼出福进”，向屋外或扮鬼者投福豆", "按年龄吃同数黄豆祈好运，面向当年惠方默食整卷惠方卷" ],
    importance: 4,
    主办地: "博丽神社"
  }, {
    month: 2,
    start_day: 8,
    end_day: 8,
    name: "事八日（祭针节/厄日）",
    type: "seasonal_festival",
    customs: [ "神明的力量变得衰弱的厄日", "年末年初的神圣期在此结束，人类之世的一年在这一天才开始" ],
    importance: 1,
    主办地: "人间之里"
  }, {
    month: 2,
    start_day: 10,
    end_day: 11,
    name: "雾之湖·冰雪祭",
    type: "matsuri",
    customs: [ "湖畔与冰面展出大型雪雕与冰雕，夜间点灯映湖", "设置雪地娱乐与小吃摊位，提醒游客注意冰面安全" ],
    importance: 3,
    主办地: "雾之湖"
  }, {
    month: 2,
    start_day: 14,
    end_day: 14,
    name: "情人节",
    type: "observance",
    customs: [ "女性向男性赠巧克力（本命、朋友或礼节性），商家推出礼盒", "为白色情人节做准备，记录收受与回礼清单" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 2,
    start_day: 15,
    end_day: 15,
    name: "涅槃会",
    type: "matsuri",
    customs: [ "命莲寺每年都会举办涅槃会。" ],
    importance: 2,
    主办地: "命莲寺"
  }, {
    month: 3,
    start_day: 3,
    end_day: 3,
    name: "女儿节（雏祭）",
    type: "seasonal_festival",
    customs: [ "在家陈列雏人形祈愿女孩健康成长", "食用菱饼、雏霰、散寿司与蛤蜊清汤", "键山雏出售纸片制作的速成雏人偶并取得了很高的人气", "雏人偶是为了积攒厄运，再扔掉的东西", "新的雏人偶完全是一次性的雏人偶。女儿节一过去了就全都被扔在河里任凭它漂走", "键山雏会回收扔进河里的雏人偶" ],
    importance: 3,
    主办地: "人间之里"
  }, {
    month: 3,
    start_day: 14,
    end_day: 14,
    name: "白色情人节（回礼日）",
    type: "observance",
    customs: [ "男性向情人节赠与者回礼，多为糖果、点心或小饰品", "商铺推出回礼专区与包装服务" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 3,
    start_day: 20,
    end_day: 20,
    name: "春分日（彼岸日）",
    type: "national_holiday",
    customs: [ "祭扫先祖，供彼岸饼与鲜花", "维持生者与亡者分界的礼仪与秩序", "所谓彼岸日就是每年白昼和黑夜一样长的那一天，因为太阳和月亮有着相同的强度，借力于幽冥之事物也能显出原形来", "彼岸日的幽灵很多", "博丽灵梦会在彼岸日前往墓地抑制灵力", "从神社看去，彼岸日的太阳正好是从鸟居正中升起。太阳从鸟居正中升起的这个时节，它的力量达到最大。这样的太阳沉落到墓地时，正是抑制灵力的最佳时刻" ],
    importance: 3,
    主办地: "墓地"
  }, {
    month: 3,
    start_day: 25,
    end_day: 31,
    name: "花见（赏樱）",
    type: "seasonal_festival",
    customs: [ "亲友席地野餐欣赏樱花，夜间观赏点灯樱景", "爱护树木，不扰动周边结界设施与生态" ],
    importance: 2,
    主办地: "无名之丘"
  }, {
    month: 5,
    start_day: 5,
    end_day: 5,
    name: "儿童节（端午）",
    type: "national_holiday",
    customs: [ "悬挂鲤鱼旗，陈设武者人偶或头盔祈健康成长", "吃柏饼与粽子，洗菖蒲汤辟邪" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 5,
    start_day: 16,
    end_day: 18,
    name: "博丽神社例大祭",
    type: "matsuri",
    customs: [ "神轿巡游、参拜与各类摊位，绘卷与展售热闹非凡", "遵循巫女指示，避免触碰结界设施" ],
    importance: 4,
    主办地: "博丽神社"
  }, {
    month: 5,
    start_day: 20,
    end_day: 23,
    name: "守矢神社大祭",
    type: "matsuri",
    customs: [ "山道花车与神轿巡行，祭乐鼓吹与祈愿仪式", "与神灵庙大祭轮替为年度盛典" ],
    importance: 4,
    主办地: "守矢神社"
  }, {
    month: 6,
    start_day: 7,
    end_day: 14,
    name: "神灵庙大祭",
    type: "matsuri",
    customs: [ "古装行列出巡与法会雅乐，巡至山麓与里外边境", "与守矢神社大祭轮替为年度盛典" ],
    importance: 4,
    主办地: "神灵庙"
  }, {
    month: 7,
    start_day: 7,
    end_day: 7,
    name: "七夕",
    type: "seasonal_festival",
    customs: [ "写愿望短册并挂于竹枝，商街布置彩笺竹饰", "部分地区按旧历在八月举行配套活动" ],
    importance: 3,
    主办地: "人间之里"
  }, {
    month: 7,
    start_day: 27,
    end_day: 31,
    name: "妖怪之山·天狗祭",
    type: "matsuri",
    customs: [ "整月分期举行祭礼与展列，中旬与下旬进行两次盛大巡行", "宵山张灯结彩，山民与来客交流繁盛" ],
    importance: 4,
    主办地: "妖怪之山"
  }, {
    month: 7,
    start_day: 21,
    end_day: 21,
    name: "海之日（湖岸庆典）",
    type: "national_holiday",
    customs: [ "湖岸感恩水域恩惠的净湖仪式与划舟活动", "水上安全讲习与湖滨清洁行动" ],
    importance: 3,
    主办地: "风神之湖"
  }, {
    month: 7,
    start_day: 24,
    end_day: 25,
    name: "天神祭",
    type: "matsuri",
    customs: [ "陆上巡行与水上灯列，夜空花火与太鼓表演", "祈学业与文运兴隆" ],
    importance: 4,
    主办地: "神灵庙"
  }, {
    month: 8,
    start_day: 11,
    end_day: 11,
    name: "山之日",
    type: "national_holiday",
    customs: [ "组织登山健行与自然体验活动", "提醒参与者遵守山域安全与结界规则" ],
    importance: 2,
    主办地: "妖怪之山"
  }, {
    month: 8,
    start_day: 2,
    end_day: 7,
    name: "虹龙洞·睡魔灯祭",
    type: "matsuri",
    customs: [ "洞外巡游大型发光花灯与舞队，终夜烟火与灯河压轴", "提示游客注意洞窟通道与灵气涌动时段" ],
    importance: 4,
    主办地: "虹龙洞"
  }, {
    month: 8,
    start_day: 12,
    end_day: 12,
    name: "人间之里·盂兰盆舞大会",
    type: "matsuri",
    customs: [ "舞队击太鼓与三味线，市民与来客可入场共舞", "设摊与夜市，营造节庆氛围" ],
    importance: 4,
    主办地: "人间之里"
  }, {
    month: 8,
    start_day: 13,
    end_day: 16,
    name: "盂兰盆",
    type: "seasonal_festival",
    customs: [ "迎魂灯笼引路、扫墓祭祖与设灵位供品", "送魂以放河灯或送火作结，可于三途河边祈愿" ],
    importance: 5,
    主办地: "命莲寺"
  }, {
    month: 9,
    start_day: 23,
    end_day: 23,
    name: "秋分日（彼岸日）",
    type: "national_holiday",
    customs: [ "祭扫先祖，供彼岸饼与鲜花", "维持生者与亡者分界的礼仪与秩序", "所谓彼岸日就是每年白昼和黑夜一样长的那一天，因为太阳和月亮有着相同的强度，借力于幽冥之事物也能显出原形来", "彼岸日的幽灵很多", "博丽灵梦会在彼岸日前往墓地抑制灵力", "从神社看去，彼岸日的太阳正好是从鸟居正中升起。太阳从鸟居正中升起的这个时节，它的力量达到最大。这样的太阳沉落到墓地时，正是抑制灵力的最佳时刻" ],
    importance: 3,
    主办地: "墓地"
  }, {
    month: 9,
    start_day: 21,
    end_day: 21,
    name: "月见（例月祭）",
    type: "seasonal_festival",
    customs: [ "供月见团子、芒草与时令薯栗，赏月小酌作诗", "推荐于高丘或湖岸观月，避开危险地带", "永远亭会在月地距离最近的满月之日举行名为例月祭的祭典，是由八意永琳发起的。", "例月祭当天，永远亭的居民会将团子之类的圆形物体当作满月，相对的远离它，用这样的行为来防止月之使者的降临。" ],
    importance: 3,
    主办地: "永远亭"
  }, {
    month: 10,
    start_day: 1,
    end_day: 2,
    name: "丰收祭",
    type: "seasonal_festival",
    customs: [ "近几年才开始在博丽神社举办的小型祭典，博丽灵梦会用‘这个时候献上供奉的话神灵会特别高兴哦’的奇怪理由要求每个到访祭典的人献上比往常更多的供奉。", "实际上是贫困的博丽灵梦为了积攒过冬的粮食杜撰硬凑出来的奇怪祭典，虽然大家心知肚明，但还是会主动给贫困的博丽神社献上一点供奉。", "掌管幻想乡的秋天的红叶之神秋静叶和丰收之神秋穰子也会在这一天在博丽神社献身，和大家一起庆祝。" ],
    importance: 1,
    主办地: "博丽神社"
  }, {
    month: 11,
    start_day: 15,
    end_day: 15,
    name: "七五三",
    type: "seasonal_festival",
    customs: [ "三岁五岁七岁儿童身着礼服参拜祈福，食用千岁糖", "家庭正式合影留念" ],
    importance: 3,
    主办地: "博丽神社"
  }, {
    month: 11,
    start_day: 24,
    end_day: 25,
    name: "酉之市",
    type: "seasonal_festival",
    customs: [ "博丽神社每年都举办的热闹集市" ],
    importance: 2,
    主办地: "博丽神社"
  }, {
    month: 12,
    start_day: 8,
    end_day: 8,
    name: "事八日（祭针节/厄日）",
    type: "seasonal_festival",
    customs: [ "神明的力量变得衰弱的厄日", "年末年初的神圣期在此结束，人类之世的一年在这一天才开始" ],
    importance: 1,
    主办地: "人间之里"
  }, {
    month: 12,
    start_day: 25,
    end_day: 25,
    name: "圣诞节（冬季庆典）",
    type: "observance",
    customs: [ "冬季灯饰、蛋糕与炸鸡套餐流行，情侣约会氛围", "城馆举办公益夜会与音乐演出" ],
    importance: 3,
    主办地: "红魔馆"
  }, {
    month: 12,
    start_day: 31,
    end_day: 31,
    name: "大晦日（除夜）",
    type: "seasonal_festival",
    customs: [ "食跨年荞麦面祈长寿越年", "寺院敲钟一百零八声以祓除烦恼，迎接新年", "红魔馆会在这天举行晚宴，吃荞麦面。", "雾雨魔理沙会早早地来到博丽神社进行新年参拜。", "命莲寺会举办除夕夜钟活动。" ],
    importance: 4,
    主办地: "博丽神社"
  } ],
  runtime: {
    clock: {
      now: {
        year: 1,
        month: 4,
        day: 15,
        hm: "14:30",
        periodName: "下午",
        iso: "0001-04-15T14:30:00"
      }
    }
  },
  文文新闻: "今日头条：幻想乡天气持续晴朗，适合外出。",
  附加正文: "（这里是附加的说明文本）",
  incidents: {
    红雾异变: {
      异变名称: "红雾异变",
      异变进程: "已解决",
      异变退治者: [ "博丽灵梦", "雾雨魔理沙" ]
    }
  },
  世界: {
    timeProgress: 500,
    天气: "晴朗"
  }
};

const missingData = {
  config: {
    ui: {},
    defaults: {}
  },
  user: {
    姓名: "玩家",
    所在地区: "博丽神社"
  },
  chars: {
    博丽灵梦: {
      所在地区: "博丽神社"
    }
  },
  world: {
    map_ascii: null,
    map_graph: {
      edges: []
    }
  },
  runtime: {},
  festivals_list: [],
  文文新闻: "",
  附加正文: [],
  incidents: {},
  世界: {}
};

const boundaryData = {
  config: {
    ui: {
      theme: "invalid-theme",
      mainFontPercent: 300,
      fontScaleStepPct: "not-a-number"
    },
    defaults: {
      fallbackPlace: "迷途竹林"
    },
    incident: {
      cooldown: 10,
      immediate_trigger: true,
      random_pool: false
    },
    meetStuff: {
      skipVisitHunters: true
    },
    nightStuff: {
      skipSleepHunters: true
    },
    affection: {
      affectionStages: [ [ -100, "HATE" ], [ 100, "LOVE" ] ],
      loveThreshold: 100,
      hateThreshold: -100
    }
  },
  user: {
    姓名: "玩家",
    所在地区: "博丽神社"
  },
  chars: {
    博丽灵梦: {
      所在地区: "博丽神社",
      好感度: 100
    },
    雾雨魔理沙: {
      所在地区: "博丽神社",
      好感度: -100
    }
  },
  world: {
    map_ascii: "[人间之里] -- [迷途竹林]",
    map_graph: {
      edges: []
    }
  },
  runtime: {
    clock: {
      now: {
        year: 99,
        month: 12,
        day: 31,
        hm: "23:59"
      }
    }
  },
  festivals_list: null,
  文文新闻: "一条非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的测试新闻，用于检查文本是否会正确换行和溢出处理。",
  附加正文: "附加正文",
  incidents: {},
  世界: {
    timeProgress: 1e12,
    天气: "雨xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
};

$(() => {
  const panel = $("<div>").attr("id", "demo-era-test-harness").css({
    position: "fixed",
    top: "10px",
    left: "10px",
    zIndex: 9999,
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "5px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
  }).appendTo($("body"));
  $("<div><strong>UI 测试工具</strong></div>").css({
    marginBottom: "5px",
    borderBottom: "1px solid #eee",
    paddingBottom: "5px"
  }).appendTo(panel);
  const buttons = [ {
    text: "发送“标准”数据",
    data: standardData
  }, {
    text: "发送“缺失”数据",
    data: missingData
  }, {
    text: "发送“边界”数据",
    data: boundaryData
  } ];
  buttons.forEach(btnInfo => {
    $("<button>").text(btnInfo.text).css({
      cursor: "pointer",
      padding: "8px 12px",
      border: "1px solid #ddd",
      background: "#f0f0f0",
      borderRadius: "4px"
    }).on("click", () => {
      console.log(`[Test Harness] 发送事件 Test:writeDone，场景: ${btnInfo.text}`);
      eventEmit("Test:writeDone", {
        statWithoutMeta: btnInfo.data
      });
      toastr.success(`已发送测试事件：${btnInfo.text}`);
    }).appendTo(panel);
  });
  toastr.info("ERA 测试工具已加载。");
  $(window).on("pagehide", function() {
    $("body").find('[id^="demo-"]').remove();
  });
});