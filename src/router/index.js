import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Game2048 from '../views/Game2048.vue'
import Tetris from '../views/Tetris.vue'
import Snake from '../views/Snake.vue'
import TapTheDot from '../views/TapTheDot.vue'
import CatWhackMole from '../views/CatWhackMole.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/game/2048',
    name: 'Game2048',
    component: Game2048
  },
  {
    path: '/game/tetris',
    name: 'Tetris',
    component: Tetris
  },
  {
    path: '/game/snake',
    name: 'Snake',
    component: Snake
  },
  {
    path: '/game/tap-the-dot',
    name: 'TapTheDot',
    component: TapTheDot
  },
  {
    path: '/game/cat-whack-mole',
    name: 'CatWhackMole',
    component: CatWhackMole
  }
]

const router = createRouter({
  history: createWebHashHistory(), // 使用 hash 模式适配 GitHub Pages
  routes
})

export default router