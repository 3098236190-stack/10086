export type PracticeSectionKey =
  | "letter"
  | "mirror"
  | "cognitive"
  | "meditation"
  | "question";

export type PracticeDay = {
  id: number;
  week: number;
  minutes: number;
  season: string;
  phase: string;
  title: string;
  subtitle?: string;
  tag?: string;
  sections: {
    letter: string[];
    mirror: string[];
    cognitive: string[];
    meditation: string[];
    question: string[];
  };
};

export const practices: PracticeDay[] = [
  {
    id: 1,
    week: 1,
    minutes: 5,
    season: "SPRING · AWAKENING",
    phase: "看见",
    title: "回避：也许，你已经准备好了",
    tag: "从看见开始",
    sections: {
      letter: [
        "也许你已经回避自己很久了。",
        "你可能不喜欢照镜子，不喜欢被拍照，也不喜欢认真看见自己的脸。",
        "但今天不需要改变什么。你只需要允许自己停下来，看见自己。",
      ],
      mirror: [
        "找一面镜子，安静地看着自己 30 秒。",
        "不要评价，不要挑错，也不要急着变好。",
        "只在心里说一句：我看见你了。",
      ],
      cognitive: [
        "写下你最近一次回避镜子、照片或外貌评价的经历。",
        "问自己：当时我真正害怕的是什么？",
        "这个害怕一定等于事实吗？",
      ],
      meditation: [
        "闭上眼睛，慢慢吸气 4 秒，呼气 6 秒。",
        "把注意力放在脸部、肩膀和胸口。",
        "对自己说：现在，我不需要攻击自己。",
      ],
      question: [
        "如果今天的你不需要立刻变好，你最想对自己说什么？",
      ],
    },
  },
  {
    id: 2,
    week: 1,
    minutes: 8,
    season: "SPRING · AWAKENING",
    phase: "看见",
    title: "内在小孩：那个一直被你责怪的人",
    tag: "重新理解自己",
    sections: {
      letter: [
        "很多时候，你以为自己讨厌的是现在的脸。",
        "但更深处，也许是过去某个被嘲笑、被比较、被忽视的自己。",
        "今天，我们不是要责怪他，而是试着靠近他。",
      ],
      mirror: [
        "看着镜子里的自己，想象这是小时候的你。",
        "如果他正感到难过，你会继续责怪他吗？",
        "试着对他说：你已经很不容易了。",
      ],
      cognitive: [
        "写下一个你小时候关于外貌、身体或自我价值的记忆。",
        "这个记忆是否影响了你现在看待自己的方式？",
        "今天的你，是否还必须继续相信当时别人给你的评价？",
      ],
      meditation: [
        "想象小时候的自己坐在你面前。",
        "你不需要说很多话，只需要陪他坐一会儿。",
        "轻轻告诉他：我现在会慢慢保护你。",
      ],
      question: [
        "如果你可以抱抱小时候的自己，你最想告诉他什么？",
      ],
    },
  },
  {
    id: 3,
    week: 1,
    minutes: 10,
    season: "SPRING · AWAKENING",
    phase: "看见",
    title: "相机焦虑：你不是一张照片",
    tag: "拆掉单一视角",
    sections: {
      letter: [
        "一张照片有时候会让人崩溃。",
        "但照片只是某一秒、某个角度、某种光线下的你。",
        "它不是完整的你，更不是你价值的判决书。",
      ],
      mirror: [
        "看着镜子里的自己，注意一个你平常不会批评的部位。",
        "比如眼神、眉毛、嘴角、皮肤的质感。",
        "练习从单点批评，转向整体看见。",
      ],
      cognitive: [
        "写下你看到不好看的照片时，脑子里自动出现的一句话。",
        "例如：我太丑了、我完了、别人一定会笑我。",
        "然后把它改写成更客观的话：这只是一张角度不好的照片。",
      ],
      meditation: [
        "吸气时，对自己说：我不是一张照片。",
        "呼气时，对自己说：我允许自己真实存在。",
      ],
      question: [
        "如果一张照片不能定义你，那你还希望别人看见你的什么？",
      ],
    },
  },
  {
    id: 4,
    week: 1,
    minutes: 12,
    season: "SPRING · AWAKENING",
    phase: "看见",
    title: "颜值：你不需要靠完美才值得被爱",
    tag: "松开完美标准",
    sections: {
      letter: [
        "你可能一直在追一个很高的标准。",
        "更瘦一点、更白一点、皮肤更好一点、五官更精致一点。",
        "可是，如果爱必须等到完美之后才发生，那你会永远觉得自己不够。",
      ],
      mirror: [
        "看着镜子里的自己，说出三个中性描述。",
        "不要说好看或难看，只描述事实。",
        "例如：我的眼睛是这样的，我的脸型是这样的，我现在站在这里。",
      ],
      cognitive: [
        "写下你对“好看”的三个标准。",
        "这些标准是你自己真正选择的吗？",
        "还是来自短视频、同龄人评价、家庭比较或社交媒体？",
      ],
      meditation: [
        "把手放在胸口，感受呼吸。",
        "告诉自己：我可以变好，但我不需要靠攻击自己来变好。",
      ],
      question: [
        "如果你不再用颜值给自己判刑，你会把精力用在哪里？",
      ],
    },
  },
  {
    id: 5,
    week: 1,
    minutes: 12,
    season: "SPRING · AWAKENING",
    phase: "看见",
    title: "皮肤：你身体最诚实的朋友",
    tag: "从攻击转向照顾",
    sections: {
      letter: [
        "皮肤问题很容易让人焦虑。",
        "痘痘、闭口、黑头、泛红、出油，都像是在提醒你：我不够好。",
        "但皮肤不是敌人，它更像一个信号系统。",
      ],
      mirror: [
        "今天照镜子时，不要只盯着瑕疵。",
        "试着把皮肤看作一个正在努力保护你的器官。",
        "对它说：谢谢你一直替我承受压力。",
      ],
      cognitive: [
        "写下你看到皮肤问题时最常出现的自动想法。",
        "这个想法是在解决问题，还是在制造羞耻？",
        "把它改写成：我的皮肤在提醒我需要照顾，而不是证明我很糟。",
      ],
      meditation: [
        "吸气时，想象脸部慢慢放松。",
        "呼气时，放下对皮肤的攻击。",
        "允许身体用自己的速度恢复。",
      ],
      question: [
        "如果你把皮肤当作朋友，而不是敌人，你今天会怎么照顾它？",
      ],
    },
  },
];

export const TOTAL_DAYS = 21;

export function getPracticeById(id: number): PracticeDay | undefined {
  return practices.find((practice) => practice.id === id);
}

export function getPracticesByWeek(week: number): PracticeDay[] {
  return practices.filter((practice) => practice.week === week);
}

export function getWeeks() {
  return [
    {
      week: 1,
      season: "SPRING · AWAKENING",
      phase: "看见",
      description: "先看见真实的自己，而不是继续逃避。",
    },
    {
      week: 2,
      season: "SUMMER · UNDERSTANDING",
      phase: "理解",
      description: "理解焦虑、比较和自我攻击从哪里来。",
    },
    {
      week: 3,
      season: "AUTUMN · RECONCILIATION",
      phase: "和解",
      description: "练习与身体、外貌和过去的自己重新相处。",
    },
  ];
}
