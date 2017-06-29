import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '../components/dashboard/Dashboard'
import Detail from '../components/detail/Detail'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', redirect: '/all-projects' },

    { path: '/:wikiCode', component: Dashboard,
      name: 'Dashboard',
      props: true
    },

    { path: '/:wikiCode/:area/:metric?', component: Detail,
      name: 'Detail'
    },
  ]
})
