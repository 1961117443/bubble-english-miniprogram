export function getLearnMockCourse() {
  return {
    id: 'course-animals-01',
    title: '动物朋友',
    targets: {
      words: [
        {
          id: 'lion',
          text: 'lion',
          meaningCn: '狮子',
          assets: {
            image: '/static/banner/1.jpg',
            audio: 'https://xxx/lion.mp3' // 没有音频也没关系：listen 会自动跳过
          }
        },
        {
          id: 'monkey',
          text: 'monkey',
          meaningCn: '猴子',
          assets: {
            image: '/static/banner/2.jpg',
            audio: 'https://xxx/monkey.mp3'
          }
        },
        {
          id: 'panda',
          text: 'panda',
          meaningCn: '熊猫',
          assets: {
            image: '/static/banner/3.jpg',
            audio: 'https://xxx/panda.mp3'
          }
        }
      ]
    },

    flow: {
      // 默认单词步骤模板（单词 item 没写 steps 时使用）
      defaultStepTemplate: ['listen', 'play', 'speak'],

      // 课程级奖励（只出现一次）
      reward: { stars: 2, coin: 10, stickerId: 'animal-01' },

      // 单词顺序与配置：items 即顺序来源
      items: [
        {
          wordId: 'lion',
          steps: ['listen', 'play', 'speak'],
          play: {
            gameType: 'tap',
            promptText: 'Touch the lion',
            options: [
              { wordId: 'lion', label: 'lion', image: '/static/banner/1.jpg', isAnswer: true },
              { wordId: 'monkey', label: 'monkey', image: '/static/banner/2.jpg' },
              { wordId: 'panda', label: 'panda', image: '/static/banner/3.jpg' }
            ],
            maxTry: 3
          },
          speak: { maxDurationSec: 8, allowSkip: true }
        },

        {
          wordId: 'monkey',
          // 不写 steps -> 用 defaultStepTemplate
          play: { promptText: 'Touch the monkey', maxTry: 3 },
          speak: { maxDurationSec: 8, allowSkip: true }
        },

        {
          wordId: 'panda',
          // 示例：这个词不做 speak
          steps: ['listen', 'play'],
          play: { promptText: 'Touch the panda', maxTry: 3 }
        }
      ]
    }
  }
}
