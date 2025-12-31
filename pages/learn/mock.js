export function getLearnMockCourse() {
  return {
    title: '动物园 · Lion',
    targets: {
      words: [
        {
          id: 'lion',
          text: 'lion',
          meaningCn: '狮子',
          assets: {
            image: '/static/banner/1.jpg',      // 先用你项目里已有的图片占位
            audio: '/static/audio/lion.mp3'     // 没有就先填占位，后面替换
          }
        }
      ]
    },
    steps: [
      {
        type: 'listen',
        id: 's1',
        payload: {
          autoPlay: true,
          repeat: 1
        }
      },
      {
        type: 'play',
        id: 's2',
        payload: {
          gameType: 'tap',
          promptText: 'Touch the lion',
          options: [
            { wordId: 'lion', label: 'lion', image: '/static/banner/1.jpg', isAnswer: true },
            { wordId: 'monkey', label: 'monkey', image: '/static/banner/2.jpg' },
            { wordId: 'panda', label: 'panda', image: '/static/banner/3.jpg' }
          ],
          maxTry: 3
        }
      },
			{
			  type: 'speak',
			  id: 's3',
			  payload: {
			    promptText: 'Say "lion"',
			    maxDurationSec: 8,
			    allowSkip: true
			  }
			},
			{
			  type: 'reward',
			  id: 's4',
			  payload: {
			    stars: 2,
			    coin: 10,
			    stickerId: 'sticker-zoo-lion',
			    title: '太棒啦！',
			    subTitle: '你完成了这一关 🎉'
			  }
			}

    ]
  }
}
