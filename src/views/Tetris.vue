<template>
  <div class="tetris-page">
    <div class="game-header">
      <router-link to="/" class="back-btn">
        <span class="back-arrow">←</span>
        <span>返回主页</span>
      </router-link>
      <h1 class="game-title">俄罗斯方块</h1>
    </div>
    
    <div class="tetris-container">
      <div class="game-info">
        <div class="score-board">
          <div class="score-item">
            <div class="label">得分</div>
            <div class="value">{{ score }}</div>
          </div>
          <div class="score-item">
            <div class="label">等级</div>
            <div class="value">{{ level }}</div>
          </div>
          <div class="score-item">
            <div class="label">行数</div>
            <div class="value">{{ lines }}</div>
          </div>
        </div>
        
        <div class="next-piece">
          <div class="label">下一个</div>
          <div class="preview-grid">
            <div 
              v-for="(row, rowIndex) in nextPieceGrid" 
              :key="rowIndex" 
              class="preview-row"
            >
              <div 
                v-for="(cell, colIndex) in row" 
                :key="colIndex" 
                class="preview-cell"
                :class="{ filled: cell }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="controls-info">
          <div class="control-item">A/D - 左右移动</div>
          <div class="control-item">S - 加速下降</div>
          <div class="control-item">W - 旋转</div>
          <div class="control-item">点击虚拟按钮 - 移动端控制</div>
          <div class="control-item">空格 - 暂停</div>
        </div>
      </div>
      
      <div class="game-board">
        <div class="tetris-grid">
          <div 
            v-for="(row, rowIndex) in gameBoard" 
            :key="rowIndex" 
            class="tetris-row"
          >
            <div 
              v-for="(cell, colIndex) in row" 
              :key="colIndex" 
              class="tetris-cell"
              :class="getCellClass(cell, rowIndex, colIndex)"
            ></div>
          </div>
        </div>
        
        <div v-if="gameOver" class="game-over-overlay">
          <div class="game-over-content">
            <h2>游戏结束!</h2>
            <p>最终得分: {{ score }}</p>
            <p>消除行数: {{ lines }}</p>
            <button @click="startGame" class="restart-btn">重新开始</button>
          </div>
        </div>
        
        <div v-if="paused && !gameOver" class="pause-overlay">
          <div class="pause-content">
            <h2>游戏暂停</h2>
            <p>按空格键继续</p>
          </div>
        </div>
      </div>
      
      <!-- 移动端控制按钮 -->
      <div class="mobile-tetris-controls">
        <div class="game-actions">
          <button @click="togglePause" class="action-btn pause-btn">
            {{ paused && !gameOver ? '继续' : '暂停' }}
          </button>
          <button @click="startGame" class="action-btn restart-btn">
            重新开始
          </button>
        </div>
        
        <div class="tetris-controls">
          <div class="control-row">
            <button @click="movePiece(-1, 0)" class="tetris-btn move-btn">←</button>
            <button @click="rotateCurrentPiece()" class="tetris-btn rotate-btn">↻</button>
            <button @click="movePiece(1, 0)" class="tetris-btn move-btn">→</button>
          </div>
          <div class="control-row">
            <button @click="dropPiece()" class="tetris-btn drop-btn wide">↓ 下降</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Tetris',
  setup() {
    const BOARD_WIDTH = 10
    const BOARD_HEIGHT = 20
    
    const gameBoard = ref([])
    const currentPiece = ref(null)
    const nextPiece = ref(null)
    const nextPieceGrid = ref([])
    const score = ref(0)
    const level = ref(1)
    const lines = ref(0)
    const gameOver = ref(false)
    const paused = ref(false)
    
    let gameInterval = null
    let fallSpeed = 1000

    // 方块定义
    const pieces = [
      {
        shape: [
          [1, 1, 1, 1]
        ],
        color: 'cyan'
      },
      {
        shape: [
          [1, 1],
          [1, 1]
        ],
        color: 'yellow'
      },
      {
        shape: [
          [0, 1, 0],
          [1, 1, 1]
        ],
        color: 'purple'
      },
      {
        shape: [
          [0, 1, 1],
          [1, 1, 0]
        ],
        color: 'green'
      },
      {
        shape: [
          [1, 1, 0],
          [0, 1, 1]
        ],
        color: 'red'
      },
      {
        shape: [
          [1, 0, 0],
          [1, 1, 1]
        ],
        color: 'orange'
      },
      {
        shape: [
          [0, 0, 1],
          [1, 1, 1]
        ],
        color: 'blue'
      }
    ]

    // 初始化游戏板
    const initBoard = () => {
      gameBoard.value = Array(BOARD_HEIGHT).fill().map(() => 
        Array(BOARD_WIDTH).fill(0)
      )
    }

    // 创建新方块
    const createPiece = () => {
      const piece = pieces[Math.floor(Math.random() * pieces.length)]
      return {
        shape: piece.shape.map(row => [...row]),
        color: piece.color,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
        y: 0
      }
    }

    // 生成下一个方块的预览
    const generateNextPieceGrid = () => {
      if (!nextPiece.value) return
      
      const grid = Array(4).fill().map(() => Array(4).fill(0))
      const shape = nextPiece.value.shape
      
      const offsetX = Math.floor((4 - shape[0].length) / 2)
      const offsetY = Math.floor((4 - shape.length) / 2)
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            grid[offsetY + y][offsetX + x] = 1
          }
        }
      }
      
      nextPieceGrid.value = grid
    }

    // 检查碰撞
    const checkCollision = (piece, newX, newY, newShape = null) => {
      const shape = newShape || piece.shape
      
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardX = newX + x
            const boardY = newY + y
            
            if (boardX < 0 || boardX >= BOARD_WIDTH || 
                boardY >= BOARD_HEIGHT ||
                (boardY >= 0 && gameBoard.value[boardY][boardX])) {
              return true
            }
          }
        }
      }
      return false
    }

    // 放置方块
    const placePiece = () => {
      const piece = currentPiece.value
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardY = piece.y + y
            if (boardY >= 0) {
              gameBoard.value[boardY][piece.x + x] = piece.color
            }
          }
        }
      }
    }

    // 清除完整的行
    const clearLines = () => {
      let linesCleared = 0
      
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (gameBoard.value[y].every(cell => cell !== 0)) {
          gameBoard.value.splice(y, 1)
          gameBoard.value.unshift(Array(BOARD_WIDTH).fill(0))
          linesCleared++
          y++ // 重新检查这一行
        }
      }
      
      if (linesCleared > 0) {
        lines.value += linesCleared
        score.value += linesCleared * 100 * level.value
        
        // 每消除10行升级
        if (lines.value >= level.value * 10) {
          level.value++
          fallSpeed = Math.max(100, 1000 - (level.value - 1) * 100)
          if (gameInterval) {
            clearInterval(gameInterval)
            startGameLoop()
          }
        }
      }
    }

    // 旋转方块
    const rotatePiece = (piece) => {
      const rotated = []
      for (let x = 0; x < piece.shape[0].length; x++) {
        const newRow = []
        for (let y = piece.shape.length - 1; y >= 0; y--) {
          newRow.push(piece.shape[y][x])
        }
        rotated.push(newRow)
      }
      return rotated
    }

    // 移动方块
    const movePiece = (dx, dy) => {
      if (!currentPiece.value || gameOver.value || paused.value) return
      
      const newX = currentPiece.value.x + dx
      const newY = currentPiece.value.y + dy
      
      if (!checkCollision(currentPiece.value, newX, newY)) {
        currentPiece.value.x = newX
        currentPiece.value.y = newY
        return true
      }
      return false
    }

    // 旋转当前方块
    const rotateCurrentPiece = () => {
      if (!currentPiece.value || gameOver.value || paused.value) return
      
      const rotatedShape = rotatePiece(currentPiece.value)
      
      if (!checkCollision(currentPiece.value, currentPiece.value.x, currentPiece.value.y, rotatedShape)) {
        currentPiece.value.shape = rotatedShape
      }
    }

    // 方块下降
    const dropPiece = () => {
      if (!movePiece(0, 1)) {
        placePiece()
        clearLines()
        
        currentPiece.value = nextPiece.value
        nextPiece.value = createPiece()
        generateNextPieceGrid()
        
        if (checkCollision(currentPiece.value, currentPiece.value.x, currentPiece.value.y)) {
          gameOver.value = true
          clearInterval(gameInterval)
        }
      }
    }

    // 获取单元格样式
    const getCellClass = (cell, rowIndex, colIndex) => {
      if (cell !== 0) {
        return `piece-${cell}`
      }
      
      // 检查当前方块
      const piece = currentPiece.value
      if (piece) {
        for (let y = 0; y < piece.shape.length; y++) {
          for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
              const boardX = piece.x + x
              const boardY = piece.y + y
              
              if (boardX === colIndex && boardY === rowIndex) {
                return `piece-${piece.color}`
              }
            }
          }
        }
      }
      
      return 'empty'
    }

    // 键盘控制
    const handleKeyPress = (event) => {
      if (gameOver.value) return
      
      switch (event.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          event.preventDefault()
          movePiece(-1, 0)
          break
        case 'd':
        case 'arrowright':
          event.preventDefault()
          movePiece(1, 0)
          break
        case 's':
        case 'arrowdown':
          event.preventDefault()
          dropPiece()
          break
        case 'w':
        case 'arrowup':
          event.preventDefault()
          rotateCurrentPiece()
          break
        case ' ':
          event.preventDefault()
          togglePause()
          break
      }
    }

    // 切换暂停
    const togglePause = () => {
      paused.value = !paused.value
      if (paused.value) {
        clearInterval(gameInterval)
      } else {
        startGameLoop()
      }
    }

    // 开始游戏循环
    const startGameLoop = () => {
      gameInterval = setInterval(() => {
        if (!paused.value) {
          dropPiece()
        }
      }, fallSpeed)
    }

    // 开始游戏
    const startGame = () => {
      initBoard()
      score.value = 0
      level.value = 1
      lines.value = 0
      gameOver.value = false
      paused.value = false
      fallSpeed = 1000
      
      currentPiece.value = createPiece()
      nextPiece.value = createPiece()
      generateNextPieceGrid()
      
      if (gameInterval) {
        clearInterval(gameInterval)
      }
      startGameLoop()
    }

    onMounted(() => {
      startGame()
      document.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      if (gameInterval) {
        clearInterval(gameInterval)
      }
      document.removeEventListener('keydown', handleKeyPress)
    })

    return {
      gameBoard,
      nextPieceGrid,
      score,
      level,
      lines,
      gameOver,
      paused,
      startGame,
      getCellClass,
      movePiece,
      rotateCurrentPiece,
      dropPiece,
      togglePause
    }
  }
}
</script>

<style scoped>
.tetris-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2c1810 0%, #8b4513 100%);
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
  color: #ff6b35;
  text-decoration: none;
  padding: 8px 15px;
  border: 1px solid #ff6b35;
  border-radius: 20px;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.back-btn:hover {
  background: #ff6b35;
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

.tetris-container {
  margin-top: 80px;
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 200px;
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
  color: #ff6b35;
  font-weight: bold;
  font-size: 16px;
}

.next-piece {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.next-piece .label {
  margin-bottom: 10px;
  color: #ccc;
  font-size: 14px;
}

.preview-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-row {
  display: flex;
  gap: 2px;
  justify-content: center;
}

.preview-cell {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.preview-cell.filled {
  background: #ff6b35;
  box-shadow: 0 0 5px rgba(255, 107, 53, 0.5);
}

.controls-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.game-board {
  position: relative;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
  padding: 10px;
  border: 2px solid #ff6b35;
}

.tetris-grid {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.tetris-row {
  display: flex;
  gap: 1px;
}

.tetris-cell {
  width: 25px;
  height: 25px;
  border-radius: 2px;
  transition: all 0.1s ease;
}

.tetris-cell.empty {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tetris-cell.piece-cyan { background: #00f5ff; }
.tetris-cell.piece-yellow { background: #ffff00; }
.tetris-cell.piece-purple { background: #8a2be2; }
.tetris-cell.piece-green { background: #32cd32; }
.tetris-cell.piece-red { background: #ff4500; }
.tetris-cell.piece-orange { background: #ff8c00; }
.tetris-cell.piece-blue { background: #1e90ff; }

.game-over-overlay, .pause-overlay {
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

.game-over-content, .pause-content {
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.game-over-content h2, .pause-content h2 {
  margin-bottom: 15px;
  font-size: 1.8em;
}

.game-over-content p, .pause-content p {
  margin-bottom: 15px;
  font-size: 1.1em;
}

.restart-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 25px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.restart-btn:hover {
  transform: translateY(-2px);
}

/* 移动端控制 */
.mobile-tetris-controls {
  display: none;
  margin-top: 20px;
  gap: 20px;
  flex-direction: column;
  align-items: center;
}

.game-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  background: rgba(255, 107, 53, 0.2);
  border: 2px solid #ff6b35;
  color: #ff6b35;
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

.action-btn:active {
  background: rgba(255, 107, 53, 0.4);
  transform: scale(0.95);
}

.tetris-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.control-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.tetris-btn {
  background: rgba(255, 107, 53, 0.2);
  border: 2px solid #ff6b35;
  color: #ff6b35;
  width: 60px;
  height: 50px;
  border-radius: 10px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.tetris-btn.wide {
  width: 130px;
  font-size: 1em;
}

.tetris-btn:active {
  background: rgba(255, 107, 53, 0.4);
  transform: scale(0.95);
}

.rotate-btn {
  background: rgba(255, 165, 0, 0.2);
  border-color: #ffa500;
  color: #ffa500;
}

.rotate-btn:active {
  background: rgba(255, 165, 0, 0.4);
}

@media (max-width: 768px) {
  .tetris-container {
    flex-direction: column;
    align-items: center;
  }
  
  .game-info {
    order: 2;
    width: 100%;
    max-width: 300px;
  }
  
  .tetris-cell {
    width: 20px;
    height: 20px;
  }
  
  /* 显示移动端控制 */
  .mobile-tetris-controls {
    display: flex;
    order: 3;
  }
  
  .tetris-page {
    padding: 10px;
  }
  
  .game-header .game-title {
    font-size: 1.5rem;
  }
  
  .back-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .tetris-container {
    margin-top: 70px;
    gap: 20px;
  }
  
  .game-board {
    margin-bottom: 0;
  }
}
</style>