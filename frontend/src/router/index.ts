import { createRouter, createWebHistory } from 'vue-router'

import MarketingHomePage from '../pages/MarketingHomePage.vue'
import HomePage from '../pages/HomePage.vue'
import NotesPage from '../pages/NotesPage.vue'
import InsightsPage from '../pages/InsightsPage.vue'
import ReviewPage from '../pages/ReviewPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MarketingHomePage },
    { path: '/app', redirect: '/home' },
    { path: '/home', component: HomePage },
    { path: '/notes', component: NotesPage },
    { path: '/insights', component: InsightsPage },
    { path: '/review', component: ReviewPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
