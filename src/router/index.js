import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Game2048 from '../views/Game2048.vue'
import Tetris from '../views/Tetris.vue'
import Snake from '../views/Snake.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router