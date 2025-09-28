<template>
  <div class="cyberpunk-home">
    <!-- 背景动画 -->
    <div class="bg-animation">
      <div class="grid-lines"></div>
      <div class="floating-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-container">
      <!-- 标题 -->
      <div class="title-section">
        <h1 class="cyber-title">
          <span class="glitch" data-text="CYBER GAMES">CYBER GAMES</span>
        </h1>
        <p class="subtitle">// play game //</p>
      </div>

      <!-- 游戏卡片 -->
      <div class="games-grid">
        <div class="game-card" @click="navigateToGame('2048')">
          <div class="card-header">
            <div class="card-icon">
              <div class="number-grid">
                <div class="mini-cell">2</div>
                <div class="mini-cell">0</div>
                <div class="mini-cell">4</div>
                <div class="mini-cell">8</div>
              </div>
            </div>
            <div class="card-status">
              <span class="status-dot online"></span>
              <span class="status-text">ONLINE</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="game-title">2048</h3>
            <p class="game-description">
              数字合并策略游戏<br/>
              目标: 合成2048方块
            </p>
            <div class="game-stats">
              <div class="stat">
                <span class="stat-label">难度</span>
                <span class="stat-value">★★★☆☆</span>
              </div>
              <div class="stat">
                <span class="stat-label">类型</span>
                <span class="stat-value">策略</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="play-btn">
              <span class="btn-text">启动游戏</span>
              <span class="btn-arrow">></span>
            </button>
          </div>
          <div class="card-glow"></div>
        </div>

        <!-- 更多游戏卡片 -->
        <div class="game-card" @click="navigateToGame('tetris')">
          <div class="card-header">
            <div class="card-icon">
              <div class="tetris-icon">
                <div class="tetris-block"></div>
                <div class="tetris-block"></div>
                <div class="tetris-block"></div>
                <div class="tetris-block"></div>
              </div>
            </div>
            <div class="card-status">
              <span class="status-dot online"></span>
              <span class="status-text">ONLINE</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="game-title">俄罗斯方块</h3>
            <p class="game-description">
              经典方块消除游戏<br/>
              合理摆放方块消除行
            </p>
            <div class="game-stats">
              <div class="stat">
                <span class="stat-label">难度</span>
                <span class="stat-value">★★★★☆</span>
              </div>
              <div class="stat">
                <span class="stat-label">类型</span>
                <span class="stat-value">动作</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="play-btn">
              <span class="btn-text">启动游戏</span>
              <span class="btn-arrow">></span>
            </button>
          </div>
          <div class="card-glow"></div>
        </div>

        <div class="game-card" @click="navigateToGame('snake')">
          <div class="card-header">
            <div class="card-icon">
              <div class="snake-icon">
                <div class="snake-segment head"></div>
                <div class="snake-segment body"></div>
                <div class="snake-segment body"></div>
                <div class="snake-food"></div>
              </div>
            </div>
            <div class="card-status">
              <span class="status-dot online"></span>
              <span class="status-text">ONLINE</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="game-title">贪吃蛇</h3>
            <p class="game-description">
              经典街机游戏<br/>
              控制蛇吃食物成长
            </p>
            <div class="game-stats">
              <div class="stat">
                <span class="stat-label">难度</span>
                <span class="stat-value">★★☆☆☆</span>
              </div>
              <div class="stat">
                <span class="stat-label">类型</span>
                <span class="stat-value">休闲</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="play-btn">
              <span class="btn-text">启动游戏</span>
              <span class="btn-arrow">></span>
            </button>
          </div>
          <div class="card-glow"></div>
        </div>

        <div class="game-card" @click="navigateToGame('tap-the-dot')">
          <div class="card-header">
            <div class="card-icon">
              <div class="dot-icon">
                <div class="main-dot"></div>
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
              </div>
            </div>
            <div class="card-status">
              <span class="status-dot online"></span>
              <span class="status-text">ONLINE</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="game-title">点点乐</h3>
            <p class="game-description">
              触屏反应游戏<br/>
              快速点击出现的圆点
            </p>
            <div class="game-stats">
              <div class="stat">
                <span class="stat-label">难度</span>
                <span class="stat-value">★★★☆☆</span>
              </div>
              <div class="stat">
                <span class="stat-label">类型</span>
                <span class="stat-value">反应</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="play-btn">
              <span class="btn-text">启动游戏</span>
              <span class="btn-arrow">></span>
            </button>
          </div>
          <div class="card-glow"></div>
        </div>

        <div class="game-card" @click="navigateToGame('cat-whack-mole')">
          <div class="card-header">
            <div class="card-icon">
              <div class="mole-icon">
                <div class="mole-body"></div>
                <div class="cat-paw">🐾</div>
                <div class="sparkle sparkle-1">✨</div>
                <div class="sparkle sparkle-2">⭐</div>
              </div>
            </div>
            <div class="card-status">
              <span class="status-dot online"></span>
              <span class="status-text">ONLINE</span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="game-title">🐱 年年打地鼠</h3>
            <p class="game-description">
              可爱的打地鼠游戏<br/>
              专为年年设计的大按钮
            </p>
            <div class="game-stats">
              <div class="stat">
                <span class="stat-label">难度</span>
                <span class="stat-value">★★☆☆☆</span>
              </div>
              <div class="stat">
                <span class="stat-label">类型</span>
                <span class="stat-value">休闲</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="play-btn">
              <span class="btn-text">启动游戏</span>
              <span class="btn-arrow">></span>
            </button>
          </div>
          <div class="card-glow"></div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="footer-info">
        <div class="system-info">
          <span class="info-item">[SYSTEM] 游戏平台 v2.0.48</span>
          <span class="info-item">[STATUS] 连接正常</span>
          <span class="info-item">[TIME] {{ currentTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const currentTime = ref('')
    let timeInterval = null

    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
    }

    const getParticleStyle = (index) => {
      const size = Math.random() * 4 + 1
      const left = Math.random() * 100
      const animationDelay = Math.random() * 10
      const animationDuration = Math.random() * 20 + 10
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`
      }
    }

    const navigateToGame = (gameType) => {
      if (gameType === '2048') {
        router.push('/game/2048')
      } else if (gameType === 'tetris') {
        router.push('/game/tetris')
      } else if (gameType === 'snake') {
        router.push('/game/snake')
      } else if (gameType === 'tap-the-dot') {
        router.push('/game/tap-the-dot')
      } else if (gameType === 'cat-whack-mole') {
        router.push('/game/cat-whack-mole')
      }
    }

    onMounted(() => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      currentTime,
      getParticleStyle,
      navigateToGame
    }
  }
}
</script>

<style scoped>
.cyberpunk-home {
  min-height: 100vh;
  background: #0a0a0a;
  color: #00ff9f;
  font-family: 'Courier New', monospace;
  position: relative;
  overflow-x: hidden;
}

/* 背景动画 */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 159, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 159, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  background: #00ff9f;
  border-radius: 50%;
  animation: float linear infinite;
  opacity: 0.6;
}

@keyframes float {
  0% {
    transform: translateY(100vh) scale(0);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
}

/* 主要内容 */
.main-container {
  position: relative;
  z-index: 1;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

/* 标题部分 */
.title-section {
  text-align: center;
  margin-bottom: 60px;
}

.cyber-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 20px;
  position: relative;
}

.glitch {
  position: relative;
  color: #00ff9f;
  font-size: 4rem;
  letter-spacing: 0.5rem;
  animation: glitch 2s infinite;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  animation: glitch-1 0.3s infinite;
  color: #ff0040;
  z-index: -1;
}

.glitch::after {
  animation: glitch-2 0.3s infinite;
  color: #0080ff;
  z-index: -2;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

@keyframes glitch-1 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(-2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
}

@keyframes glitch-2 {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, -2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(-2px, 2px); }
}

.subtitle {
  font-size: 1.2rem;
  color: #00bfff;
  opacity: 0.8;
  animation: text-glow 2s ease-in-out infinite alternate;
}

@keyframes text-glow {
  from { text-shadow: 0 0 5px #00bfff, 0 0 10px #00bfff; }
  to { text-shadow: 0 0 10px #00bfff, 0 0 20px #00bfff, 0 0 30px #00bfff; }
}

/* 游戏网格 */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 30px;
  max-width: 1200px;
  width: 100%;
}

/* 游戏卡片 */
.game-card {
  background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
  border: 2px solid #00ff9f;
  border-radius: 15px;
  padding: 25px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.game-card:hover {
  transform: translateY(-10px);
  border-color: #00bfff;
  box-shadow: 0 10px 30px rgba(0, 255, 159, 0.3);
}

.game-card.coming-soon {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: #666;
}

.game-card.coming-soon:hover {
  transform: none;
  border-color: #666;
  box-shadow: none;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 255, 159, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .card-glow {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 159, 0.1);
  border-radius: 10px;
  border: 1px solid #00ff9f;
}

.number-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  width: 40px;
  height: 40px;
}

.mini-cell {
  background: #00ff9f;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border-radius: 2px;
}

.coming-soon-icon {
  font-size: 24px;
  color: #666;
  font-weight: bold;
}

.tetris-icon {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  width: 40px;
  height: 40px;
}

.tetris-block {
  background: #ff6b35;
  border-radius: 2px;
}

.snake-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 40px;
  height: 40px;
}

.snake-segment {
  width: 30px;
  height: 6px;
  border-radius: 3px;
}

.snake-segment.head {
  background: #8bc34a;
  width: 35px;
}

.snake-segment.body {
  background: #4caf50;
}

.snake-food {
  width: 8px;
  height: 8px;
  background: #f44336;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
}

.dot-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-dot {
  width: 16px;
  height: 16px;
  background: #3b82f6;
  border-radius: 50%;
  position: relative;
  z-index: 3;
}

.ring {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

.ring-1 {
  width: 24px;
  height: 24px;
  border-color: rgba(59, 130, 246, 0.5);
  animation-delay: 0s;
}

.ring-2 {
  width: 32px;
  height: 32px;
  border-color: rgba(6, 182, 212, 0.3);
  animation-delay: 0.5s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.mole-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mole-body {
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, #8b4513, #a0522d);
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.mole-body::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 3px;
  height: 3px;
  background: #000;
  border-radius: 50%;
}

.mole-body::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 3px;
  height: 3px;
  background: #000;
  border-radius: 50%;
}

.cat-paw {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 16px;
  animation: paw-wave 1.5s ease-in-out infinite;
  z-index: 3;
}

@keyframes paw-wave {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-15deg) scale(1.1); }
  75% { transform: rotate(15deg) scale(1.1); }
}

.sparkle {
  position: absolute;
  font-size: 12px;
  animation: sparkle-twinkle 2s ease-in-out infinite;
}

.sparkle-1 {
  top: -2px;
  left: -2px;
  animation-delay: 0s;
}

.sparkle-2 {
  bottom: -2px;
  right: -2px;
  animation-delay: 1s;
}

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

.card-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-dot.online {
  background: #00ff9f;
}

.status-dot.offline {
  background: #666;
  animation: none;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-text {
  font-size: 12px;
  color: #888;
  font-family: 'Courier New', monospace;
}

.card-body {
  margin-bottom: 20px;
}

.game-title {
  font-size: 1.8rem;
  color: #00ff9f;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.game-description {
  color: #bbb;
  line-height: 1.5;
  margin-bottom: 15px;
  font-size: 14px;
}

.game-stats {
  display: flex;
  gap: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.stat-value {
  font-size: 14px;
  color: #00bfff;
}

.card-footer {
  display: flex;
  justify-content: center;
}

.play-btn {
  background: linear-gradient(45deg, #00ff9f, #00bfff);
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  color: #000;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
}

.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(0, 255, 159, 0.4);
}

.play-btn.disabled {
  background: #333;
  color: #666;
  cursor: not-allowed;
}

.play-btn.disabled:hover {
  transform: none;
  box-shadow: none;
}

.btn-arrow {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.play-btn:hover .btn-arrow {
  transform: translateX(5px);
}

/* 底部信息 */
.footer-info {
  margin-top: 60px;
  width: 100%;
  max-width: 1200px;
}

.system-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #666;
  font-family: 'Courier New', monospace;
}

.info-item {
  padding: 5px 10px;
  border: 1px solid #333;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cyber-title,
  .glitch {
    font-size: 2.5rem;
    letter-spacing: 0.2rem;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .system-info {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .main-container {
    padding: 20px 15px;
  }
  
  .game-card {
    padding: 20px;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
  }
  
  .number-grid {
    width: 35px;
    height: 35px;
  }
  
  .mini-cell {
    font-size: 8px;
  }
  
  .tetris-icon {
    width: 35px;
    height: 35px;
  }
  
  .snake-icon {
    width: 35px;
    height: 35px;
  }
  
  .snake-segment {
    width: 25px;
    height: 5px;
  }
  
  .snake-segment.head {
    width: 30px;
  }
  
  .game-title {
    font-size: 1.5rem;
  }
  
  .game-description {
    font-size: 13px;
  }
  
  .play-btn {
    padding: 10px 25px;
    font-size: 14px;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .title-section {
    margin-bottom: 40px;
  }
  
  .footer-info {
    margin-top: 40px;
  }
  
  /* 优化手机点击体验 */
  .game-card {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  
  .play-btn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
}

@media (max-width: 480px) {
  .cyber-title,
  .glitch {
    font-size: 2rem;
    letter-spacing: 0.1rem;
  }
  
  .main-container {
    padding: 15px 10px;
  }
  
  .game-card {
    padding: 15px;
    margin: 0 5px;
  }
  
  .games-grid {
    gap: 15px;
  }
  
  .bg-animation {
    opacity: 0.3; /* 减少背景动画在小屏幕上的干扰 */
  }
}
</style>