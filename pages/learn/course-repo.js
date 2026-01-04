// pages/learn/course-repo.js

import { getLearnMockCourse } from './mock'

/** =========================
 *  公共：默认儿童年龄（先不做本地存储/后端）
 *  LearnPage v2(unit 调度) 会用到
 *  ========================= */
export function getDefaultChildAge() {
  return 5
}

/** =========================
 *  v1 课程（你现有的）
 *  ========================= */
function courseAnimals() {
  return getLearnMockCourse()
}

function courseFarm() {
  const c = getLearnMockCourse()
  c.id = 'course-farm-01'
  c.title = '农场日常'
  if (c.flow) c.flow.reward = { stars: 2, coin: 8, stickerId: 'farm-01' }
  if (c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets) {
    c.targets.words[0].assets.image = '/static/banner/2.jpg'
  }
  return c
}

function courseBody() {
  const c = getLearnMockCourse()
  c.id = 'course-body-01'
  c.title = '我的身体'
  if (c.flow) c.flow.reward = { stars: 3, coin: 12, stickerId: 'body-01' }
  if (c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets) {
    c.targets.words[0].assets.image = '/static/banner/3.jpg'
  }
  return c
}

/** =========================
 *  v2 课程：熊猫（视频拆解样板）
 *  说明：先不强依赖音频，audio 为空时 LearnPage 可自动 skip listen（调试期 OK）
 *  ========================= */
function coursePandaV2() {
  return {
    id: 'course-panda-01',
    title: '熊猫 Panda',
    // 可选：展示/列表用的元信息（避免到处猜 cover）
    meta: {
      cover: '/static/banner/3.jpg',
      subtitle: '从视频里学熊猫的词语与句子'
    },

    source: { type: 'video', videoId: 'video_panda_01', duration: 56 },

    // v2：按年龄解锁的学习单元
    units: [
      // word units（minAge=3）
      { id: 'w_panda', type: 'word', text: 'panda', meaning: '熊猫', minAge: 3, assets: { image: '/static/banner/3.jpg', audio: '' } },
      { id: 'w_bamboo', type: 'word', text: 'bamboo', meaning: '竹子', minAge: 3, assets: { image: '/static/banner/2.jpg', audio: '' } },
      { id: 'w_color', type: 'word', text: 'black and white', meaning: '黑白', minAge: 3, assets: { image: '/static/banner/1.jpg', audio: '' } },
      { id: 'w_eye', type: 'word', text: 'eye', meaning: '眼睛', minAge: 3, assets: { image: '/static/banner/1.jpg', audio: '' } },
      { id: 'w_leg', type: 'word', text: 'leg', meaning: '腿', minAge: 3, assets: { image: '/static/banner/2.jpg', audio: '' } },

      // sentence units（minAge=5）
      { id: 's_color', type: 'sentence', text: 'Pandas are black and white.', meaning: '熊猫是黑白相间的。', minAge: 5, assets: { audio: '' } },
      { id: 's_food', type: 'sentence', text: 'Pandas like to eat bamboo.', meaning: '熊猫喜欢吃竹子。', minAge: 5, assets: { audio: '' } }
    ],

    // v2：不同 unit.type 对应不同 stepTemplate
    flow: {
      byUnitType: {
        word: ['listen', 'play'],
        sentence: ['listen', 'speak']
      },
      reward: { stars: 3, coin: 2, stickerId: 'panda' }
    },

    // 兼容：reward 放顶层也可以
    reward: { stars: 3, coin: 2, stickerId: 'panda' }
  }
}

/** =========================
 *  Registry
 *  ========================= */
const COURSE_REGISTRY = {
  // v1
  'course-animals-01': courseAnimals,
  'course-farm-01': courseFarm,
  'course-body-01': courseBody,

  // v2
  'course-panda-01': coursePandaV2
}

/** 今日课程 */
export function getTodayCourseId() {
  return 'course-animals-01'
}

export function getCourseById(courseId) {
  const id = courseId || getTodayCourseId()
  const factory = COURSE_REGISTRY[id]
  if (!factory) return COURSE_REGISTRY[getTodayCourseId()]()
  return factory()
}

/** 列表：用于课程列表页 */
export function listCourses() {
  return Object.keys(COURSE_REGISTRY).map(id => {
    const c = COURSE_REGISTRY[id]()
    const meta = getCourseMeta(c.id)
    const outline = getCourseOutline(c.id)
    return {
      id: c.id,
      title: c.title,
      cover: meta.cover,
      subtitle: meta.subtitle,
      wordsCount: outline.wordsCount
    }
  })
}

export function getCourseTitle(courseId) {
  const c = getCourseById(courseId)
  return (c && c.title) ? c.title : '今日课程'
}

/** =========================
 *  Helpers：判断版本 + 取封面/字幕/大纲
 *  ========================= */
function isV2Course(c) {
  return !!(c && Array.isArray(c.units))
}

function pickCoverFromV1(c) {
  return (
    (c && c.targets && c.targets.words && c.targets.words[0] && c.targets.words[0].assets && c.targets.words[0].assets.image) ||
    ''
  )
}

function pickCoverFromV2(c) {
  if (!c) return ''
  if (c.meta && c.meta.cover) return c.meta.cover
  // 兜底：找第一个有图的 unit
  const u = (c.units || []).find(x => x && x.assets && x.assets.image)
  return (u && u.assets && u.assets.image) || ''
}

/** 课程展示信息（不影响学习引擎） */
export function getCourseMeta(courseId) {
  const c = getCourseById(courseId)

  // v2：优先用 meta.subtitle；否则兜底
  if (isV2Course(c)) {
    const cover = pickCoverFromV2(c)
    const subtitle = (c.meta && c.meta.subtitle) || '从视频里学词语和句子'
    return { cover, subtitle }
  }

  // v1：你原来的逻辑
  const cover = pickCoverFromV1(c)

  const subtitleMap = {
    'course-animals-01': '认识三种可爱的动物朋友',
    'course-farm-01': '在农场里学会常见单词',
    'course-body-01': '用英语说说身体部位',

    // v2：也可配置一个更“产品”的文案（可选）
    'course-panda-01': '从视频里学熊猫相关表达'
  }

  return {
    cover,
    subtitle: subtitleMap[courseId] || '轻松完成一节小课'
  }
}

/** 课程大纲：给详情页展示用 */
export function getCourseOutline(courseId) {
  const c = getCourseById(courseId)

  // ===== v2 outline =====
  if (isV2Course(c)) {
    const units = c.units || []
    const wordUnits = units.filter(u => u && u.type === 'word')
    const sentenceUnits = units.filter(u => u && u.type === 'sentence')

    const wordsPreview = wordUnits.slice(0, 6).map(u => ({
      id: u.id,
      text: u.text || u.id,
      meaningCn: u.meaning || '',
      cover: u.assets && u.assets.image
    }))

    // flowText：按 unitType 描述（更产品）
    const map = { listen: '听', play: '玩', speak: '说', reward: '奖励' }
    const byUnitType = (c.flow && c.flow.byUnitType) || {}
    const wordFlow = (byUnitType.word && byUnitType.word.length) ? byUnitType.word : ['listen', 'play']
    const sentenceFlow = (byUnitType.sentence && byUnitType.sentence.length) ? byUnitType.sentence : ['listen', 'speak']

    const wordFlowText = wordFlow.map(x => map[x] || x).join(' → ')
    const sentenceFlowText = sentenceFlow.map(x => map[x] || x).join(' → ')

    const flowTextParts = []
    if (wordUnits.length) flowTextParts.push(`词：${wordFlowText}`)
    if (sentenceUnits.length) flowTextParts.push(`句：${sentenceFlowText}`)
    const flowText = flowTextParts.join(' ｜ ') + ' ｜ 奖励'

    return {
      // wordsCount：为了列表复用，你原本叫 wordsCount，这里返回“单元数量”
      wordsCount: units.length,
      flowText,
      wordsPreview
    }
  }

  // ===== v1 outline（你原来的逻辑）=====
  const items = (c && c.flow && c.flow.items) || []
  const words = (c && c.targets && c.targets.words) || []
  const wordMap = new Map(words.map(w => [w.id, w]))

  const wordsPreview = items.slice(0, 6).map(it => {
    const w = wordMap.get(it.wordId) || {}
    return {
      id: it.wordId,
      text: w.text || it.wordId,
      meaningCn: w.meaningCn || '',
      cover: w.assets && w.assets.image
    }
  })

  const def = (c && c.flow && c.flow.defaultStepTemplate) || ['listen', 'play', 'speak']
  const map = { listen: '听', play: '玩', speak: '说', reward: '奖励' }
  const flowText = def.map(x => map[x] || x).join(' → ') + ' → 奖励'

  return {
    wordsCount: items.length || words.length,
    flowText,
    wordsPreview
  }
}
