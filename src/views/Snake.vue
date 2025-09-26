<template>
  <div class="snake-page">
    <div class="game-header">
      <router-link to="/" class="back-btn">
        <span class="back-arrow">←</span>
        <span>返回主页</span>
      </router-link>
      <h1 class="game-title">贪吃蛇</h1>
    </div>

    <div class="snake-container">
      <div class="game-info">
        <div class="score-board">
          <div class="score-item">
            <div class="label">得分</div>
            <div class="value">{{ score }}</div>
          </div>
          <div class="score-item">
            <div class="label">长度</div>
            <div class="value">{{ snake.length }}</div>
          </div>
          <div class="score-item">
            <div class="label">最高分</div>
            <div class="value">{{ highScore }}</div>
          </div>
        </div>

        <div class="controls-info">
          <div class="control-title">控制方式</div>
          <div class="control-item">WASD - 方向控制</div>
          <div class="control-item">方向键 - 方向控制</div>
          <div class="control-item">点击虚拟按钮 - 移动端控制</div>
          <div class="control-item">空格 - 暂停/开始</div>
          <div class="control-item">R - 重新开始</div>
        </div>

        <div class="difficulty-selector">
          <div class="control-title">难度选择</div>
          <button v-for="(level, key) in difficulties" :key="key" @click="setDifficulty(key)"
            :class="['difficulty-btn', { active: currentDifficulty === key }]">
            {{ level.name }}
          </button>
        </div>
      </div>

      <div class="game-board">
        <div class="snake-grid">
          <div v-for="(row, rowIndex) in gameGrid" :key="rowIndex" class="snake-row">
            <div v-for="(cell, colIndex) in row" :key="colIndex" class="snake-cell"
              :class="getCellClass(cell, rowIndex, colIndex)"></div>
          </div>
        </div>

        <div v-if="!gameStarted && !gameOver" class="start-overlay">
          <div class="start-content">
            <h2>贪吃蛇</h2>
            <p>控制蛇吃食物，避免撞墙和自己</p>
            <button @click="startGame" class="start-btn">开始游戏</button>
          </div>
        </div>

        <div v-if="gameOver" class="game-over-overlay">
          <div class="game-over-content">
            <h2>游戏结束!</h2>
            <p>最终得分: {{ score }}</p>
            <p>蛇的长度: {{ snake.length }}</p>
            <p v-if="score === highScore && score > 0" class="new-record">🎉 新纪录!</p>
            <button @click="startGame" class="restart-btn">重新开始</button>
          </div>
        </div>

        <div v-if="paused && gameStarted && !gameOver" class="pause-overlay">
          <div class="pause-content">
            <h2>游戏暂停</h2>
            <p>按空格键继续</p>
          </div>
        </div>
      </div>
      
      <!-- 移动端控制按钮 -->
      <div class="mobile-game-controls">
        <div class="game-buttons">
          <button @click="togglePause" class="control-btn pause-btn">
            {{ paused && gameStarted && !gameOver ? '继续' : '暂停' }}
          </button>
          <button @click="startGame" class="control-btn restart-btn">
            重新开始
          </button>
        </div>
        
        <div class="direction-controls">
          <div class="direction-pad">
            <button @click="changeDirection({x: 0, y: -1})" class="direction-btn up">↑</button>
            <div class="middle-row">
              <button @click="changeDirection({x: -1, y: 0})" class="direction-btn left">←</button>
              <div class="center-space"></div>
              <button @click="changeDirection({x: 1, y: 0})" class="direction-btn right">→</button>
            </div>
            <button @click="changeDirection({x: 0, y: 1})" class="direction-btn down">↓</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Snake',
  setup() {
    const GRID_SIZE = 20

    const gameGrid = ref([])
    const snake = ref([])
    const food = ref({ x: 0, y: 0 })
    const direction = ref({ x: 1, y: 0 })
    const nextDirection = ref({ x: 1, y: 0 })
    const score = ref(0)
    const highScore = ref(0)
    const gameStarted = ref(false)
    const gameOver = ref(false)
    const paused = ref(false)
    const currentDifficulty = ref('normal')

    let gameInterval = null

    const difficulties = {
      easy: { name: '简单', speed: 200 },
      normal: { name: '普通', speed: 150 },
      hard: { name: '困难', speed: 100 },
      insane: { name: '疯狂', speed: 50 }
    }

    // 初始化游戏网格
    const initGrid = () => {
      gameGrid.value = Array(GRID_SIZE).fill().map(() =>
        Array(GRID_SIZE).fill(0)
      )
    }

    // 初始化蛇
    const initSnake = () => {
      snake.value = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ]
      direction.value = { x: 1, y: 0 }
      nextDirection.value = { x: 1, y: 0 }
    }

    // 生成食物
    const generateFood = () => {
      let newFood
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        }
      } while (snake.value.some(segment => segment.x === newFood.x && segment.y === newFood.y))

      food.value = newFood
    }

    // 移动蛇
    const moveSnake = () => {
      if (paused.value || gameOver.value) return

      direction.value = { ...nextDirection.value }

      const head = { ...snake.value[0] }
      head.x += direction.value.x
      head.y += direction.value.y

      // 检查撞墙
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame()
        return
      }

      // 检查撞自己
      if (snake.value.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame()
        return
      }

      snake.value.unshift(head)

      // 检查是否吃到食物
      if (head.x === food.value.x && head.y === food.value.y) {
        score.value += 10
        generateFood()
      } else {
        snake.value.pop()
      }
    }

    // 获取单元格样式
    const getCellClass = (cell, row, col) => {
      // 检查是否是蛇头
      if (snake.value.length > 0 && snake.value[0].x === col && snake.value[0].y === row) {
        return 'snake-head'
      }

      // 检查是否是蛇身
      if (snake.value.some((segment, index) => index > 0 && segment.x === col && segment.y === row)) {
        return 'snake-body'
      }

      // 检查是否是食物
      if (food.value.x === col && food.value.y === row) {
        return 'food'
      }

      return 'empty'
    }

    // 改变方向
    const changeDirection = (newDirection) => {
      // 防止反向移动
      if (direction.value.x + newDirection.x === 0 && direction.value.y + newDirection.y === 0) {
        return
      }
      nextDirection.value = newDirection
    }

    // 键盘控制
    const handleKeyPress = (event) => {
      if (!gameStarted.value && !gameOver.value) {
        if (event.key === ' ') {
          event.preventDefault()
          startGame()
        }
        return
      }

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          event.preventDefault()
          changeDirection({ x: 0, y: -1 })
          break
        case 's':
        case 'arrowdown':
          event.preventDefault()
          changeDirection({ x: 0, y: 1 })
          break
        case 'a':
        case 'arrowleft':
          event.preventDefault()
          changeDirection({ x: -1, y: 0 })
          break
        case 'd':
        case 'arrowright':
          event.preventDefault()
          changeDirection({ x: 1, y: 0 })
          break
        case ' ':
          event.preventDefault()
          if (gameOver.value) {
            startGame()
          } else {
            togglePause()
          }
          break
        case 'r':
          event.preventDefault()
          startGame()
          break
      }
    }

    // 切换暂停
    const togglePause = () => {
      if (!gameStarted.value || gameOver.value) return
      paused.value = !paused.value
    }

    // 设置难度
    const setDifficulty = (difficulty) => {
      currentDifficulty.value = difficulty
      if (gameStarted.value) {
        startGame() // 重新开始游戏以应用新难度
      }
    }

    // 开始游戏
    const startGame = () => {
      initGrid()
      initSnake()
      generateFood()

      score.value = 0
      gameStarted.value = true
      gameOver.value = false
      paused.value = false

      if (gameInterval) {
        clearInterval(gameInterval)
      }

      gameInterval = setInterval(moveSnake, difficulties[currentDifficulty.value].speed)
    }

    // 结束游戏
    const endGame = () => {
      gameOver.value = true
      gameStarted.value = false

      if (score.value > highScore.value) {
        highScore.value = score.value
        localStorage.setItem('snake-high-score', highScore.value.toString())
      }

      if (gameInterval) {
        clearInterval(gameInterval)
      }
    }

    onMounted(() => {
      const savedHighScore = localStorage.getItem('snake-high-score')
      if (savedHighScore) {
        highScore.value = parseInt(savedHighScore)
      }

      initGrid()
      initSnake()
      generateFood()

      document.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      if (gameInterval) {
        clearInterval(gameInterval)
      }
      document.removeEventListener('keydown', handleKeyPress)
    })

    return {
      gameGrid,
      snake,
      food,
      score,
      highScore,
      gameStarted,
      gameOver,
      paused,
      currentDifficulty,
      difficulties,
      startGame,
      setDifficulty,
      getCellClass,
      changeDirection,
      togglePause
    }
  }
}
</script>

<style scoped>
.snake-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a4c1a 0%, #2d7d32 100%);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
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
  color: #4caf50;
  text-decoration: none;
  padding: 8px 15px;
  border: 1px solid #4caf50;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.back-btn:hover {
  background: #4caf50;
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

.snake-container {
  margin-top: 80px;
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 220px;
}

.score-board {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.score-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.score-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #ccc;
  font-size: 14px;
}

.value {
  color: #4caf50;
  font-weight: bold;
  font-size: 16px;
}

.controls-info,
.difficulty-selector {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.control-title {
  font-size: 14px;
  color: #4caf50;
  margin-bottom: 10px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.control-item {
  font-size: 12px;
  color: #ccc;
  margin-bottom: 5px;
  font-family: 'Courier New', monospace;
}

.control-item:last-child {
  margin-bottom: 0;
}

.difficulty-btn {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  color: #4caf50;
  padding: 8px 12px;
  margin: 2px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
}

.difficulty-btn:hover {
  background: rgba(76, 175, 80, 0.3);
}

.difficulty-btn.active {
  background: #4caf50;
  color: #000;
  font-weight: bold;
}

.game-board {
  position: relative;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 10px;
  border: 2px solid #4caf50;
}

.snake-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.snake-row {
  display: flex;
  gap: 1px;
}

.snake-cell {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  transition: all 0.1s ease;
}

.snake-cell.empty {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.snake-cell.snake-head {
  background: #8bc34a;
  box-shadow: 0 0 10px rgba(139, 195, 74, 0.8);
  border: 2px solid #4caf50;
}

.snake-cell.snake-body {
  background: #4caf50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.6);
}

.snake-cell.food {
  background: #f44336;
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.8);
  border-radius: 50%;
  animation: food-pulse 1s ease-in-out infinite alternate;
}

@keyframes food-pulse {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.1);
  }
}

.start-overlay,
.game-over-overlay,
.pause-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.start-content,
.game-over-content,
.pause-content {
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.start-content h2,
.game-over-content h2,
.pause-content h2 {
  margin-bottom: 15px;
  font-size: 1.8em;
  color: #4caf50;
}

.start-content p,
.game-over-content p,
.pause-content p {
  margin-bottom: 15px;
  font-size: 1.1em;
}

.new-record {
  color: #ff9800;
  font-weight: bold;
  font-size: 1.2em !important;
}

.start-btn,
.restart-btn {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 25px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.start-btn:hover,
.restart-btn:hover {
  transform: translateY(-2px);
}

/* 移动端控制 */
.mobile-game-controls {
  display: none;
  margin-top: 20px;
  gap: 20px;
  flex-direction: column;
  align-items: center;
}

.game-buttons {
  display: flex;
  gap: 15px;
}

.control-btn {
  background: rgba(76, 175, 80, 0.2);
  border: 2px solid #4caf50;
  color: #4caf50;
  padding: 12px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.control-btn:active {
  background: rgba(76, 175, 80, 0.4);
  transform: scale(0.95);
}

.direction-controls {
  display: flex;
  justify-content: center;
}

.direction-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.middle-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.direction-btn {
  background: rgba(76, 175, 80, 0.2);
  border: 2px solid #4caf50;
  color: #4caf50;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 1.8em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.direction-btn:active {
  background: rgba(76, 175, 80, 0.4);
  transform: scale(0.95);
}

.center-space {
  width: 60px;
  height: 60px;
}

@media (max-width: 768px) {
  .snake-container {
    flex-direction: column;
    align-items: center;
  }

  .game-info {
    order: 2;
    width: 100%;
    max-width: 300px;
  }

  .snake-cell {
    width: 15px;
    height: 15px;
  }

  .difficulty-selector {
    text-align: center;
  }
  
  /* 显示移动端控制 */
  .mobile-game-controls {
    display: flex;
    order: 3;
  }
  
  .snake-page {
    padding: 10px;
  }
  
  .game-header .game-title {
    font-size: 1.5rem;
  }
  
  .back-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .snake-container {
    margin-top: 70px;
    gap: 20px;
  }
}
</style>