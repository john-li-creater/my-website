<template>
  <div class="game-page">
    <div class="game-header">
      <router-link to="/" class="back-btn">
        <span class="back-arrow">←</span>
        <span>返回主页</span>
      </router-link>
      <h1 class="game-title">2048 小游戏</h1>
    </div>
    
    <div class="app">
      <div class="score-container">
        <div class="score">
          <div class="score-label">得分</div>
          <div class="score-value">{{ score }}</div>
        </div>
        <div class="best-score">
          <div class="score-label">最高</div>
          <div class="score-value">{{ bestScore }}</div>
        </div>
      </div>
      <div class="game-container">
        <div class="grid-container">
          <div 
            v-for="(row, rowIndex) in grid" 
            :key="rowIndex" 
            class="grid-row"
          >
            <div 
              v-for="(cell, colIndex) in row" 
              :key="colIndex" 
              class="grid-cell"
              :class="getCellClass(cell)"
            >
              <span v-if="cell !== 0">{{ cell }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="controls">
        <button @click="resetGame" class="reset-btn">重新开始</button>
        <div class="instructions">
          使用滑动手势控制游戏
        </div>
      </div>
      <div v-if="gameOver" class="game-over">
        <div class="game-over-content">
          <h2>游戏结束!</h2>
          <p>最终得分: {{ score }}</p>
          <button @click="resetGame" class="restart-btn">再玩一次</button>
        </div>
      </div>
      <div v-if="isWin" class="win">
        <div class="win-content">
          <h2>恭喜！你赢了!</h2>
          <p>你成功达到了2048!</p>
          <button @click="continueGame" class="continue-btn">继续游戏</button>
          <button @click="resetGame" class="restart-btn">重新开始</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Game2048',
  setup() {
    const grid = ref([])
    const score = ref(0)
    const bestScore = ref(0)
    const gameOver = ref(false)
    const isWin = ref(false)
    const hasWon = ref(false)
    
    // 触摸控制相关
    const touchStartX = ref(0)
    const touchStartY = ref(0)
    const MIN_SWIPE_DISTANCE = 50

    // 初始化游戏网格
    const initGrid = () => {
      grid.value = Array(4).fill().map(() => Array(4).fill(0))
    }

    // 在随机位置添加新数字
    const addRandomNumber = () => {
      const emptyCells = []
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (grid.value[i][j] === 0) {
            emptyCells.push({ row: i, col: j })
          }
        }
      }
      
      if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        grid.value[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4
      }
    }

    // 检查是否有移动可能
    const canMove = () => {
      // 检查是否有空位
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (grid.value[i][j] === 0) return true
        }
      }
      
      // 检查是否有相邻相同数字可以合并
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const current = grid.value[i][j]
          if (
            (i < 3 && grid.value[i + 1][j] === current) ||
            (j < 3 && grid.value[i][j + 1] === current)
          ) {
            return true
          }
        }
      }
      
      return false
    }

    // 移动逻辑
    const move = (direction) => {
      if (gameOver.value) return
      
      const previousGrid = grid.value.map(row => [...row])
      let moved = false
      let currentScore = score.value

      if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
          const row = grid.value[i].filter(cell => cell !== 0)
          for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
              row[j] *= 2
              currentScore += row[j]
              row.splice(j + 1, 1)
            }
          }
          while (row.length < 4) {
            row.push(0)
          }
          grid.value[i] = row
        }
      } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
          const row = grid.value[i].filter(cell => cell !== 0)
          for (let j = row.length - 1; j > 0; j--) {
            if (row[j] === row[j - 1]) {
              row[j] *= 2
              currentScore += row[j]
              row.splice(j - 1, 1)
              j--
            }
          }
          while (row.length < 4) {
            row.unshift(0)
          }
          grid.value[i] = row
        }
      } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
          const column = []
          for (let i = 0; i < 4; i++) {
            if (grid.value[i][j] !== 0) {
              column.push(grid.value[i][j])
            }
          }
          for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
              column[i] *= 2
              currentScore += column[i]
              column.splice(i + 1, 1)
            }
          }
          while (column.length < 4) {
            column.push(0)
          }
          for (let i = 0; i < 4; i++) {
            grid.value[i][j] = column[i]
          }
        }
      } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
          const column = []
          for (let i = 0; i < 4; i++) {
            if (grid.value[i][j] !== 0) {
              column.push(grid.value[i][j])
            }
          }
          for (let i = column.length - 1; i > 0; i--) {
            if (column[i] === column[i - 1]) {
              column[i] *= 2
              currentScore += column[i]
              column.splice(i - 1, 1)
              i--
            }
          }
          while (column.length < 4) {
            column.unshift(0)
          }
          for (let i = 0; i < 4; i++) {
            grid.value[i][j] = column[i]
          }
        }
      }

      // 检查是否有移动
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (grid.value[i][j] !== previousGrid[i][j]) {
            moved = true
            break
          }
        }
        if (moved) break
      }

      if (moved) {
        score.value = currentScore
        if (score.value > bestScore.value) {
          bestScore.value = score.value
          localStorage.setItem('2048-best-score', bestScore.value.toString())
        }
        
        addRandomNumber()
        
        // 检查是否达到2048
        if (!hasWon.value) {
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
              if (grid.value[i][j] === 2048) {
                isWin.value = true
                hasWon.value = true
                return
              }
            }
          }
        }
        
        // 检查游戏是否结束
        if (!canMove()) {
          gameOver.value = true
        }
      }
    }

    // 键盘事件处理
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          move('left')
          break
        case 'ArrowRight':
          event.preventDefault()
          move('right')
          break
        case 'ArrowUp':
          event.preventDefault()
          move('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          move('down')
          break
      }
    }

    // 重置游戏
    const resetGame = () => {
      initGrid()
      score.value = 0
      gameOver.value = false
      isWin.value = false
      hasWon.value = false
      addRandomNumber()
      addRandomNumber()
    }

    // 触摸事件处理
    const handleTouchStart = (event) => {
      const touch = event.touches[0]
      touchStartX.value = touch.clientX
      touchStartY.value = touch.clientY
    }

    const handleTouchEnd = (event) => {
      if (gameOver.value) return
      
      const touch = event.changedTouches[0]
      const deltaX = touch.clientX - touchStartX.value
      const deltaY = touch.clientY - touchStartY.value
      
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)
      
      // 检查是否达到最小滑动距离
      if (absDeltaX < MIN_SWIPE_DISTANCE && absDeltaY < MIN_SWIPE_DISTANCE) {
        return
      }
      
      // 确定滑动方向
      if (absDeltaX > absDeltaY) {
        // 水平滑动
        if (deltaX > 0) {
          move('right')
        } else {
          move('left')
        }
      } else {
        // 垂直滑动
        if (deltaY > 0) {
          move('down')
        } else {
          move('up')
        }
      }
    }

    // 防止默认触摸行为
    const handleTouchMove = (event) => {
      event.preventDefault()
    }

    // 继续游戏
    const continueGame = () => {
      isWin.value = false
    }

    // 获取单元格样式类
    const getCellClass = (value) => {
      if (value === 0) return 'empty'
      return `tile-${value}`
    }

    // 初始化游戏
    onMounted(() => {
      const savedBestScore = localStorage.getItem('2048-best-score')
      if (savedBestScore) {
        bestScore.value = parseInt(savedBestScore)
      }
      
      resetGame()
      document.addEventListener('keydown', handleKeyPress)
      
      // 添加触摸事件监听
      const gameContainer = document.querySelector('.game-container')
      if (gameContainer) {
        gameContainer.addEventListener('touchstart', handleTouchStart, { passive: true })
        gameContainer.addEventListener('touchend', handleTouchEnd, { passive: true })
        gameContainer.addEventListener('touchmove', handleTouchMove, { passive: false })
      }
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyPress)
      
      // 移除触摸事件监听
      const gameContainer = document.querySelector('.game-container')
      if (gameContainer) {
        gameContainer.removeEventListener('touchstart', handleTouchStart)
        gameContainer.removeEventListener('touchend', handleTouchEnd)
        gameContainer.removeEventListener('touchmove', handleTouchMove)
      }
    })

    return {
      grid,
      score,
      bestScore,
      gameOver,
      isWin,
      resetGame,
      continueGame,
      getCellClass,
      move
    }
  }
}
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.app {
  max-width: 600px;
  margin: 80px auto 0;
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.score, .best-score {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.score-label {
  font-size: 0.9em;
  opacity: 0.8;
  margin-bottom: 5px;
}

.score-value {
  font-size: 1.8em;
  font-weight: bold;
}

.game-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 30px;
}

.grid-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grid-row {
  display: flex;
  gap: 10px;
}

.grid-cell {
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  font-weight: bold;
  transition: all 0.2s ease;
}

.grid-cell.empty {
  background: rgba(255, 255, 255, 0.05);
}

.grid-cell.tile-2 { background: #eee4da; color: #776e65; }
.grid-cell.tile-4 { background: #ede0c8; color: #776e65; }
.grid-cell.tile-8 { background: #f2b179; color: #f9f6f2; }
.grid-cell.tile-16 { background: #f59563; color: #f9f6f2; }
.grid-cell.tile-32 { background: #f67c5f; color: #f9f6f2; }
.grid-cell.tile-64 { background: #f65e3b; color: #f9f6f2; }
.grid-cell.tile-128 { background: #edcf72; color: #f9f6f2; font-size: 1.5em; }
.grid-cell.tile-256 { background: #edcc61; color: #f9f6f2; font-size: 1.5em; }
.grid-cell.tile-512 { background: #edc850; color: #f9f6f2; font-size: 1.5em; }
.grid-cell.tile-1024 { background: #edc53f; color: #f9f6f2; font-size: 1.2em; }
.grid-cell.tile-2048 { background: #edc22e; color: #f9f6f2; font-size: 1.2em; box-shadow: 0 0 20px rgba(237, 194, 46, 0.5); }

.controls {
  text-align: center;
}

.reset-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-bottom: 15px;
}

.reset-btn:hover {
  transform: translateY(-2px);
}

.instructions {
  font-size: 1.1em;
  opacity: 0.8;
}



.game-over, .win {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-over-content, .win-content {
  background: white;
  color: #333;
  padding: 40px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.game-over-content h2, .win-content h2 {
  margin-bottom: 15px;
  font-size: 2em;
}

.game-over-content p, .win-content p {
  margin-bottom: 25px;
  font-size: 1.2em;
}

.restart-btn, .continue-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 25px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  margin: 0 10px;
  transition: transform 0.2s ease;
}

.restart-btn:hover, .continue-btn:hover {
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .grid-cell {
    width: 70px;
    height: 70px;
    font-size: 1.4em;
  }
  
  .grid-cell.tile-128,
  .grid-cell.tile-256,
  .grid-cell.tile-512 {
    font-size: 1.1em;
  }
  
  .grid-cell.tile-1024,
  .grid-cell.tile-2048 {
    font-size: 0.9em;
  }
  
  .game-header .game-title {
    font-size: 1.5rem;
  }
  
  .back-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  

  
  .instructions {
    font-size: 0.9em;
  }
  
  .game-container {
    margin-bottom: 20px;
  }
  
  .app {
    padding: 10px;
  }
  
  .score-container {
    gap: 15px;
    margin-bottom: 20px;
  }
  
  .score, .best-score {
    padding: 10px 20px;
  }
  
  .score-value {
    font-size: 1.5em;
  }
}
</style>