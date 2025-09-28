<template>
  <div class="game-page">
    <div class="game-header">
      <router-link to="/" class="back-btn">
        <span class="back-arrow">←</span>
        <span>返回主页</span>
      </router-link>
      <h1 class="game-title">🐱 年年打地鼠 🐭</h1>
    </div>

    <div class="container">
      <div class="controls">
        <button @click="startGame" class="start-btn">{{ startBtnText }}</button>
        <button @click="pauseToggle" class="small pause-btn">{{ pauseBtnText }}</button>
      </div>

      <div class="meta">
        <div>🎯 年年抓住调皮的地鼠！</div>
      </div>

      <div class="panel">
        <div class="hud">
          <div class="badge">🏆 分数: <span>{{ score }}</span></div>
          <div class="badge">⏰ 时间: <span>{{ Math.ceil(timeLeft) }}</span>s</div>
          <div class="badge">🎯 连击: <span>{{ combo }}</span></div>
        </div>

        <div class="center-overlay" v-show="showOverlay">
          <div class="msg">{{ overlayMessage }}</div>
        </div>

        <div class="game-board">
          <div 
            v-for="(hole, index) in holes" 
            :key="index"
            class="hole-container"
            @click="whackMole(index)"
            @touchstart="whackMole(index)"
          >
            <div class="hole">
              <div 
                v-if="hole.hasMole" 
                class="mole"
                :class="{ 'hiding': hole.hiding, 'special': hole.isSpecial }"
              >
                <div class="mole-face">
                  <div class="mole-eyes">
                    <div class="eye left"></div>
                    <div class="eye right"></div>
                  </div>
                  <div class="mole-nose"></div>
                  <div class="mole-mouth"></div>
                  <div v-if="hole.isSpecial" class="crown">👑</div>
                </div>
              </div>
              <div class="hole-number">{{ index + 1 }}</div>
            </div>
            <div v-if="hole.showScore" class="score-popup">+{{ hole.scoreValue }}</div>
          </div>
        </div>

        <!-- 粒子效果 -->
        <div class="particles-container">
          <div 
            v-for="particle in particles" 
            :key="particle.id"
            class="particle"
            :style="particle.style"
          >
            {{ particle.emoji }}
          </div>
        </div>
      </div>

      <div class="footer">
        <div>🏅 最高分: <span>{{ best }}</span></div>
        <div>💡 提示: 金冠地鼠分数更高！连续命中有额外奖励</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export default {
  name: 'CatWhackMole',
  setup() {
    const score = ref(0)
    const best = ref(0)
    const timeLeft = ref(60) // 60秒游戏时间
    const combo = ref(0)
    const playing = ref(false)
    const paused = ref(false)
    const showOverlay = ref(true)
    const overlayMessage = ref('准备好帮小猫抓地鼠了吗？🐱')
    const startBtnText = ref('开始游戏')
    const pauseBtnText = ref('暂停')
    
    // 9个洞穴
    const holes = ref(Array(9).fill().map((_, index) => ({
      hasMole: false,
      hiding: false,
      isSpecial: false,
      showScore: false,
      scoreValue: 0,
      timer: null
    })))

    const particles = ref([])
    let particleId = 0
    let gameTimer = null
    let moleSpawnTimer = null

    // 随机选择洞穴
    const getRandomHole = () => {
      const availableHoles = holes.value
        .map((hole, index) => ({ hole, index }))
        .filter(({ hole }) => !hole.hasMole)
      
      if (availableHoles.length === 0) return null
      return availableHoles[Math.floor(Math.random() * availableHoles.length)]
    }

    // 生成地鼠
    const spawnMole = () => {
      if (!playing.value || paused.value) return

      const randomHole = getRandomHole()
      if (!randomHole) return

      const { hole, index } = randomHole
      const isSpecial = Math.random() < 0.2 // 20% 概率生成特殊地鼠

      hole.hasMole = true
      hole.hiding = false
      hole.isSpecial = isSpecial

      // 地鼠存在时间（根据分数调整难度）
      const hideTime = Math.max(800, 2000 - score.value * 10)
      
      hole.timer = setTimeout(() => {
        if (hole.hasMole) {
          hole.hiding = true
          setTimeout(() => {
            hole.hasMole = false
            hole.hiding = false
            hole.isSpecial = false
          }, 300)
        }
      }, hideTime)
    }

    // 击打地鼠
    const whackMole = (index) => {
      if (!playing.value || paused.value) return

      const hole = holes.value[index]
      if (!hole.hasMole || hole.hiding) {
        // 打空了，重置连击
        combo.value = 0
        return
      }

      // 清除定时器
      if (hole.timer) {
        clearTimeout(hole.timer)
        hole.timer = null
      }

      // 计算分数
      let points = hole.isSpecial ? 50 : 10
      combo.value++
      
      // 连击奖励
      if (combo.value > 1) {
        points += combo.value * 2
      }

      score.value += points
      hole.scoreValue = points
      hole.showScore = true

      // 隐藏地鼠
      hole.hiding = true
      setTimeout(() => {
        hole.hasMole = false
        hole.hiding = false
        hole.isSpecial = false
        hole.showScore = false
      }, 300)

      // 创建粒子效果
      createParticles(index, hole.isSpecial)

      // 播放音效（这里用振动代替）
      if ('vibrate' in navigator) {
        navigator.vibrate(hole.isSpecial ? [50, 50, 50] : [50])
      }
    }

    // 创建粒子效果
    const createParticles = (holeIndex, isSpecial) => {
      const emojis = isSpecial ? ['✨', '🌟', '💫', '👑'] : ['💥', '🎉', '🐾', '❤️']
      
      for (let i = 0; i < (isSpecial ? 6 : 4); i++) {
        const particle = {
          id: particleId++,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          style: {
            position: 'absolute',
            left: `${(holeIndex % 3) * 33.33 + 16.66}%`,
            top: `${Math.floor(holeIndex / 3) * 33.33 + 16.66}%`,
            fontSize: '24px',
            pointerEvents: 'none',
            animation: `particle-float-${Math.floor(Math.random() * 4)} 1s ease-out forwards`,
            zIndex: 1000
          }
        }
        particles.value.push(particle)

        // 1秒后移除粒子
        setTimeout(() => {
          const index = particles.value.findIndex(p => p.id === particle.id)
          if (index > -1) {
            particles.value.splice(index, 1)
          }
        }, 1000)
      }
    }

    // 游戏循环
    const gameLoop = () => {
      if (!playing.value || paused.value) return

      timeLeft.value -= 0.1
      if (timeLeft.value <= 0) {
        endGame()
        return
      }

      // 根据时间和分数调整地鼠生成频率
      const spawnChance = Math.min(0.8, 0.1 + score.value * 0.01)
      if (Math.random() < spawnChance) {
        spawnMole()
      }

      setTimeout(gameLoop, 100)
    }

    // 开始游戏
    const startGame = () => {
      if (playing.value) {
        resetGame()
        return
      }
      
      playing.value = true
      paused.value = false
      score.value = 0
      combo.value = 0
      timeLeft.value = 60
      showOverlay.value = false
      startBtnText.value = '重新开始'
      pauseBtnText.value = '暂停'

      // 清理现有的地鼠
      holes.value.forEach(hole => {
        if (hole.timer) {
          clearTimeout(hole.timer)
          hole.timer = null
        }
        hole.hasMole = false
        hole.hiding = false
        hole.isSpecial = false
        hole.showScore = false
      })

      gameLoop()
    }

    // 重置游戏
    const resetGame = () => {
      playing.value = false
      paused.value = false
      score.value = 0
      combo.value = 0
      timeLeft.value = 60
      overlayMessage.value = '准备好帮小猫抓地鼠了吗？🐱'
      showOverlay.value = true
      startBtnText.value = '开始游戏'

      // 清理所有定时器和状态
      holes.value.forEach(hole => {
        if (hole.timer) {
          clearTimeout(hole.timer)
          hole.timer = null
        }
        hole.hasMole = false
        hole.hiding = false
        hole.isSpecial = false
        hole.showScore = false
      })

      particles.value = []
    }

    // 暂停/继续
    const pauseToggle = () => {
      if (!playing.value) return
      
      paused.value = !paused.value
      pauseBtnText.value = paused.value ? '继续' : '暂停'
      overlayMessage.value = paused.value ? '游戏已暂停 😴' : ''
      showOverlay.value = paused.value

      if (!paused.value) {
        gameLoop()
      }
    }

    // 结束游戏
    const endGame = () => {
      playing.value = false
      overlayMessage.value = `游戏结束！小猫抓到了 ${score.value} 只地鼠！🎉`
      showOverlay.value = true
      
      if (score.value > best.value) {
        best.value = score.value
        localStorage.setItem('cat-whack-mole-best', best.value.toString())
        overlayMessage.value += '\n🏆 新纪录！'
      }
      
      startBtnText.value = '再来一局'

      // 清理所有定时器
      holes.value.forEach(hole => {
        if (hole.timer) {
          clearTimeout(hole.timer)
          hole.timer = null
        }
      })
    }

    onMounted(async () => {
      await nextTick()
      
      // 从本地存储加载最高分
      const savedBest = localStorage.getItem('cat-whack-mole-best')
      if (savedBest) {
        best.value = Number(savedBest)
      }

      // 添加粒子动画样式
      const style = document.createElement('style')
      style.textContent = `
        @keyframes particle-float-0 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(-30px, -50px) scale(1); opacity: 0; }
        }
        @keyframes particle-float-1 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(30px, -50px) scale(1); opacity: 0; }
        }
        @keyframes particle-float-2 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(-20px, -60px) scale(1); opacity: 0; }
        }
        @keyframes particle-float-3 {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          100% { transform: translate(20px, -60px) scale(1); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    })

    onUnmounted(() => {
      // 清理所有定时器
      holes.value.forEach(hole => {
        if (hole.timer) {
          clearTimeout(hole.timer)
        }
      })
      if (gameTimer) clearInterval(gameTimer)
      if (moleSpawnTimer) clearInterval(moleSpawnTimer)
    })

    return {
      score,
      best,
      timeLeft,
      combo,
      showOverlay,
      overlayMessage,
      startBtnText,
      pauseBtnText,
      holes,
      particles,
      startGame,
      pauseToggle,
      whackMole,
      Math
    }
  }
}
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
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
  max-width: 800px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(2,6,23,0.6);
  padding: 20px;
  margin-top: 80px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.start-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a6f);
  color: white;
  border: 0;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 6px 18px rgba(238, 90, 111, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(238, 90, 111, 0.4);
}

.pause-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 8px;
  color: #e6eef8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pause-btn:hover {
  background: rgba(255,255,255,0.1);
}

.meta {
  margin-bottom: 20px;
  font-size: 14px;
  color: rgba(230,238,248,0.8);
  text-align: center;
  line-height: 1.6;
}

.panel {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.05));
  border-radius: 16px;
  padding: 20px;
  position: relative;
  min-height: 500px;
}

.hud {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.badge {
  background: rgba(0,0,0,0.4);
  padding: 8px 15px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
}

.center-overlay {
  position: absolute;
  inset: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
  background: rgba(0,0,0,0.8);
  border-radius: 12px;
}

.msg {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 20px 30px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 18px;
  text-align: center;
  pointer-events: auto;
  white-space: pre-line;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.hole-container {
  position: relative;
  aspect-ratio: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.hole {
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, #2d1810 0%, #1a0f08 70%, #0f0804 100%);
  border-radius: 50%;
  position: relative;
  border: 3px solid #8b4513;
  box-shadow: 
    inset 0 -20px 40px rgba(0,0,0,0.8),
    0 4px 8px rgba(0,0,0,0.3);
  overflow: hidden;
  transition: all 0.2s ease;
}

.hole:hover {
  transform: scale(1.05);
}

.hole-number {
  position: absolute;
  bottom: 5px;
  right: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  font-weight: bold;
}

.mole {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 80%;
  background: linear-gradient(145deg, #8b4513, #a0522d);
  border-radius: 50% 50% 50% 50%;
  animation: mole-appear 0.3s ease-out;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mole.hiding {
  animation: mole-hide 0.3s ease-in;
}

.mole.special {
  background: linear-gradient(145deg, #ffd700, #ffed4e);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  animation: mole-appear 0.3s ease-out, special-glow 1s ease-in-out infinite alternate;
}

@keyframes mole-appear {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes mole-hide {
  from {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  to {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
}

@keyframes special-glow {
  from { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
  to { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
}

.mole-face {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 60%;
}

.mole-eyes {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.eye {
  width: 8px;
  height: 8px;
  background: #000;
  border-radius: 50%;
  animation: blink 3s infinite;
}

@keyframes blink {
  0%, 95% { transform: scaleY(1); }
  97% { transform: scaleY(0.1); }
  100% { transform: scaleY(1); }
}

.mole-nose {
  width: 6px;
  height: 4px;
  background: #000;
  border-radius: 50%;
  margin: 0 auto 4px;
}

.mole-mouth {
  width: 12px;
  height: 6px;
  border: 2px solid #000;
  border-top: none;
  border-radius: 0 0 12px 12px;
  margin: 0 auto;
}

.crown {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  animation: crown-sparkle 1s ease-in-out infinite alternate;
}

@keyframes crown-sparkle {
  from { transform: translateX(-50%) scale(1); }
  to { transform: translateX(-50%) scale(1.2); }
}

.score-popup {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #00ff9f, #00bfff);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  animation: score-popup 1s ease-out forwards;
  pointer-events: none;
  z-index: 10;
}

@keyframes score-popup {
  0% {
    transform: translateX(-50%) translateY(0) scale(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) translateY(-20px) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translateX(-50%) translateY(-40px) scale(1);
    opacity: 0;
  }
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.particle {
  position: absolute;
  font-size: 24px;
  pointer-events: none;
  user-select: none;
}

.footer {
  margin-top: 20px;
  font-size: 13px;
  color: rgba(230,238,248,0.75);
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  gap: 20px;
}

@media (max-width: 768px) {
  .game-header .game-title {
    font-size: 1.4rem;
  }
  
  .back-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .container {
    margin-top: 70px;
    padding: 15px;
  }
  
  .game-board {
    gap: 10px;
  }
  
  .hud {
    gap: 10px;
  }
  
  .badge {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .msg {
    padding: 15px 20px;
    font-size: 16px;
  }
  
  .meta {
    font-size: 13px;
  }
  
  .footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .start-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .pause-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .game-header .game-title {
    font-size: 1.2rem;
  }
  
  .container {
    margin-top: 60px;
    padding: 10px;
  }
  
  .panel {
    padding: 15px;
  }
  
  .game-board {
    gap: 8px;
  }
  
  .mole-face {
    width: 80%;
    height: 70%;
  }
  
  .eye {
    width: 6px;
    height: 6px;
  }
  
  .mole-nose {
    width: 4px;
    height: 3px;
  }
  
  .mole-mouth {
    width: 8px;
    height: 4px;
  }
  
  .crown {
    font-size: 16px;
    top: -12px;
  }
}
</style>