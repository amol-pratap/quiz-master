import index from './components/index.js'
import home from './components/home.js'
import navbar from './components/navbar.js'
import footer from './components/footer.js'
import sign_up from './components/sign_up.js'
import login from './components/login.js'




const routes = [
    { path: '/', component: index },
    { path: '/index', component: home },
    { path: '/navbar', component: navbar },
    { path: '/footer', component: footer },
    { path: '/sign_up', component: sign_up },
    { path: '/login', component: login }
]

const router = new VueRouter({
    routes  //routes : routes
})


const app = new Vue({
    el: '#app',
    router, //router : router
    template: `
    
   
    <div class="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <foot></foot>
    </div>
    `,
    data: {
        section: "Frontend"
},
components:{
    "nav-bar": navbar,
    "foot": footer
    }


})
