// common/learn/audio-hub.js
// A tiny global hub to manage innerAudioContext instances across steps.
// Used to pause/stop all step audio when the course video is playing.

const _ctxSet = new Set()

function register(ctx) {
  if (!ctx) return
  _ctxSet.add(ctx)
}

function unregister(ctx) {
  if (!ctx) return
  _ctxSet.delete(ctx)
}

function pauseAll() {
  _ctxSet.forEach((ctx) => {
    try {
      if (typeof ctx.pause === 'function') ctx.pause()
      else if (typeof ctx.stop === 'function') ctx.stop()
    } catch (e) {}
  })
}

function stopAll() {
  _ctxSet.forEach((ctx) => {
    try {
      if (typeof ctx.stop === 'function') ctx.stop()
      else if (typeof ctx.pause === 'function') ctx.pause()
    } catch (e) {}
  })
}

export default {
  register,
  unregister,
  pauseAll,
  stopAll
}
