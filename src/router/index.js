import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/home.vue'
import welcome from '../components/welcome.vue'
import users from '../components/user/User.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'

Vue.use(Router)
const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: welcome },
        { path: '/users', component: users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
// to 要访问那个路径
// from 从哪里来
// next 执行下一步

  if (to.path === '/login') return next()
  else {
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
  }
})
export default router
