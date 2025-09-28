<template>
  <div class="game-page">
    <div class="game-header">
      <router-link to="/" class="back-btn">
        <span class="back-arrow">←</span>
        <span>返回主页</span>
      </router-link>
      <h1 class="game-title">点点乐 </h1>
    </div>

    <div class="container">
      <div class="controls">
        <button @click="startGame" class="start-btn">{{ startBtnText }}</button>
        <button @click="pauseToggle" class="small pause-btn">{{ pauseBtnText }}</button>
      </div>

      <div class="meta">
        <div>说明：点击出现的圆点得分。每次得分会加快节奏。</div>
      </div>

      <div class="panel">
        <div class="hud">
          <div class="badge">分数: <span>{{ score }}</span></div>
          <div class="badge">时间: <span>{{ Math.ceil(timeLeft) }}</span>s</div>
        </div>

        <div class="center-overlay" v-show="showOverlay">
          <div class="msg">{{ overlayMessage }}</div>
        </div>

        <canvas 
          ref="gameCanvas" 
          class="game-area"
          @touchstart="handleTap"
          @mousedown="handleTap"
        ></canvas>
      </div>

      <div class="footer">
        <div>最高分: <span>{{ best }}</span></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'TapTheDot',
  setup() {
    const gameCanvas = ref(null)
    const score = ref(0)
    const best = ref(0)
    const timeLeft = ref(30)
    const playing = ref(false)
    const paused = ref(false)
    const showOverlay = ref(true)
    const overlayMessage = ref('准备好了？')
    const startBtnText = ref('开始')
    const pauseBtnText = ref('暂停')
    
    let ctx = null
    let W = 0, H = 0
    let dot = null
    let lastTick = 0
    let spawnInterval = 1000
    let tickReq = null

    const resize = () => {
      if (!gameCanvas.value) return
      
      const ratio = window.devicePixelRatio || 1
      const rect = gameCanvas.value.getBoundingClientRect()
      W = rect.width
      H = rect.height
      gameCanvas.value.width = Math.floor(W * ratio)
      gameCanvas.value.height = Math.floor(H * ratio)
      gameCanvas.value.style.width = rect.width + 'px'
      gameCanvas.value.style.height = rect.height + 'px'
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const rand = (min, max) => Math.random() * (max - min) + min

    const spawnDot = () => {
      const minR = Math.max(18 - Math.floor(score.value / 5), 12)
      const maxR = Math.max(40 - Math.floor(score.value / 3), 18)
      const r = rand(minR, maxR)
      const margin = r + 6
      const x = rand(margin, W - margin)
      const y = rand(margin, H - margin)
      const ttl = Math.max(500, spawnInterval - score.value * 10)
      dot = { x, y, r, ttl, born: performance.now() }
    }

    const pointInside = (px, py, d) => {
      const dx = px - d.x
      const dy = py - d.y
      return dx * dx + dy * dy <= d.r * d.r
    }

    const handleTap = (ev) => {
      if (!playing.value || paused.value) return
      ev.preventDefault()
      
      let x, y
      if (ev.changedTouches && ev.changedTouches[0]) {
        const rect = gameCanvas.value.getBoundingClientRect()
        x = ev.changedTouches[0].clientX - rect.left
        y = ev.changedTouches[0].clientY - rect.top
      } else {
        const rect = gameCanvas.value.getBoundingClientRect()
        x = ev.clientX - rect.left
        y = ev.clientY - rect.top
      }
      
      if (dot && pointInside(x, y, dot)) {
        score.value++
        spawnInterval = Math.max(350, spawnInterval - 20)
        spawnDot()
        flash()
      }
    }

    const flash = () => {
      if (!dot) return
      const now = performance.now()
      const end = now + 120
      const originalR = dot.r
      
      const step = () => {
        const t = performance.now()
        const p = Math.min(1, (end - t) / 120)
        
        ctx.save()
        drawBackground()
        
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, originalR + (1 - p) * 20, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${0.18 + (1 - p) * 0.4})`
        ctx.fill()
        ctx.restore()
        
        if (t < end) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const drawBackground = () => {
      ctx.clearRect(0, 0, W, H)
    }

    const drawDot = (d) => {
      if (!d) return
      
      // outer ring
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r + 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(6,182,212,0.06)'
      ctx.fill()
      
      // main circle with gradient
      const g = ctx.createRadialGradient(
        d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.1,
        d.x, d.y, d.r
      )
      g.addColorStop(0, '#3b82f6')
      g.addColorStop(1, '#06b6d4')
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = g
      ctx.fill()
      
      // inner highlight
      ctx.beginPath()
      ctx.arc(d.x - d.r * 0.25, d.y - d.r * 0.25, d.r * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.fill()
    }

    const gameLoop = (ts) => {
      if (!lastTick) lastTick = ts
      const dt = ts - lastTick
      lastTick = ts

      if (playing.value && !paused.value) {
        timeLeft.value -= dt / 1000
        if (timeLeft.value <= 0) {
          timeLeft.value = 0
          endGame()
        }

        if (!dot) {
          spawnDot()
        } else {
          const age = ts - dot.born
          if (age > dot.ttl) {
            score.value = Math.max(0, score.value - 1)
            spawnDot()
          }
        }
      }

      drawBackground()
      if (!playing.value) {
        ctx.fillStyle = 'rgba(255,255,255,0.02)'
        ctx.fillRect(0, 0, W, H)
      }
      if (dot) drawDot(dot)

      tickReq = requestAnimationFrame(gameLoop)
    }

    const startGame = () => {
      if (playing.value) {
        resetGame()
        return
      }
      
      playing.value = true
      paused.value = false
      score.value = 0
      spawnInterval = 1000
      timeLeft.value = 30
      dot = null
      showOverlay.value = false
      startBtnText.value = '重玩'
      pauseBtnText.value = '暂停'
      lastTick = 0
      
      if (!tickReq) {
        tickReq = requestAnimationFrame(gameLoop)
      }
    }

    const resetGame = () => {
      playing.value = false
      paused.value = false
      score.value = 0
      timeLeft.value = 30
      dot = null
      overlayMessage.value = '准备好了？'
      showOverlay.value = true
      startBtnText.value = '开始'
      
      if (tickReq) {
        cancelAnimationFrame(tickReq)
        tickReq = null
        lastTick = 0
      }
    }

    const pauseToggle = () => {
      if (!playing.value) return
      
      paused.value = !paused.value
      pauseBtnText.value = paused.value ? '继续' : '暂停'
      overlayMessage.value = paused.value ? '已暂停' : ''
      showOverlay.value = paused.value
    }

    const endGame = () => {
      playing.value = false
      dot = null
      overlayMessage.value = `游戏结束！得分 ${score.value}`
      showOverlay.value = true
      
      if (score.value > best.value) {
        best.value = score.value
        localStorage.setItem('tap-best', best.value.toString())
        overlayMessage.value += ' — 新纪录！'
      }
      
      startBtnText.value = '再来一次'
    }

    const preventScroll = (e) => {
      if (playing.value) e.preventDefault()
    }

    onMounted(async () => {
      await nextTick()
      
      if (gameCanvas.value) {
        ctx = gameCanvas.value.getContext('2d', { alpha: true })
        
        // 从本地存储加载最高分
        const savedBest = localStorage.getItem('tap-best')
        if (savedBest) {
          best.value = Number(savedBest)
        }
        
        resize()
        resetGame()
        
        // 开始主循环
        tickReq = requestAnimationFrame(gameLoop)
        
        // 添加事件监听器
        window.addEventListener('resize', resize)
        document.body.addEventListener('touchmove', preventScroll, { passive: false })
      }
    })

    onUnmounted(() => {
      if (tickReq) {
        cancelAnimationFrame(tickReq)
      }
      window.removeEventListener('resize', resize)
      document.body.removeEventListener('touchmove', preventScroll)
    })

    return {
      gameCanvas,
      score,
      best,
      timeLeft,
      showOverlay,
      overlayMessage,
      startBtnText,
      pauseBtnText,
      startGame,
      pauseToggle,
      handleTap,
      Math
    }
  }
}
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f1724, #071022);
  color: #e6eef8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.game-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00ff9f;
  text-decoration: none;
  padding: 8px 15px;
  border: 1px solid #00ff9f;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.back-btn:hover {
  background: #00ff9f;
  color: #000;
  transform: translateX(-3px);
}

.back-arrow {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-arrow {
  transform: translateX(-3px);
}

.game-header .game-title {
  font-size: 1.8rem;
  color: white;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.container {
  width: 100%;
  max-width: 720px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.6);
  padding: 12px;
  margin-top: 80px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.start-btn {
  background: #3b82f6;
  color: white;
  border: 0;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  box-shadow: 0 6px 18px rgba(59,130,246,0.18);
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59,130,246,0.25);
}

.pause-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.06);
  padding: 6px 8px;
  border-radius: 8px;
  color: #e6eef8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pause-btn:hover {
  background: rgba(255,255,255,0.05);
}

.meta {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 13px;
  color: rgba(230,238,248,0.75);
}

.panel {
  margin-top: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02));
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.game-area {
  width: 100%;
  aspect-ratio: 16/9;
  touch-action: manipulation;
  cursor: pointer;
}

.hud {
  position: absolute;
  left: 8px;
  top: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 10;
}

.badge {
  background: rgba(0,0,0,0.35);
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  backdrop-filter: blur(6px);
}

.center-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 8;
  pointer-events: none;
}

.msg {
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  color: white;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  pointer-events: auto;
}

.footer {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(230,238,248,0.75);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 420px) {
  .game-header .game-title {
    font-size: 1.5rem;
  }
  
  .back-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .start-btn, .pause-btn {
    padding: 8px 10px;
    font-size: 13px;
  }
  
  .meta {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .footer {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .container {
    margin-top: 70px;
  }
}
</style>