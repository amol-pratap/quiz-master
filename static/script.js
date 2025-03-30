import index from './components/index.js'
import home from './components/home.js'
import navbar from './components/navbar.js'
import footer from './components/footer.js'
import sign_up from './components/sign_up.js'
import login from './components/login.js'
import admin_dashboard from './components/admin_dashboard.js'
import subject from './components/add_subject.js'
import chapter from './components/add_chapter.js'
import quiz from './components/quiz.js'
import u_quiz from './components/u_quiz.js'
import take_quiz from './components/take_quiz.js'
import score from './components/score.js'
import add_quiz from './components/add_quiz.js'
import add_question from './components/add_question.js'
import edit_subject from './components/edit_subject.js'
import edit_chapter from './components/edit_chapter.js'
import edit_quiz from './components/edit_quiz.js'
import edit_question from './components/edit_question.js'
import u_search from './components/u_search.js';
import a_search from './components/a_search.js';
import u_summary from './components/u_summary.js';
import u_profile from './components/u_profile.js';
import a_summary from './components/a_summary.js';





const routes = [
    { path: '/', component: index },
    { path: '/home', component: home },
    { path: '/navbar', component: navbar },
    { path: '/footer', component: footer },
    { path: '/sign_up', component: sign_up },
    { path: '/login', component: login },
    { path: '/admin_dashboard', component: admin_dashboard },
    { path: '/add_subject', component: subject},
    { path: '/add_chapter/:subject_id', name:'chapter', component: chapter},

    { path: '/quiz/:chapter_id', name:'quiz', component: quiz},
    { path: '/u_quiz/:chapter_id', name:'u_quiz', component: u_quiz},
    { path: '/take_quiz/:quiz_id', name:'take_quiz', component: take_quiz},
    { path: '/score/:quiz_id', name:'score', component: score},
    { path: '/add_quiz/:chapter_id', name:'add_quiz', component: add_quiz},
    { path: '/add_question/:quiz_id', name:'add_question', component: add_question},
    { path: '/edit_subject/:subject_id', name:'edit_subject', component: edit_subject},
    { path: '/edit_chapter/:chapter_id', name:'edit_chapter', component: edit_chapter},
    { path: '/edit_quiz/:quiz_id', name:'edit_quiz', component: edit_quiz},
    { path: '/edit_question/:question_id', name:'edit_question', component: edit_question},

    { path: '/u_search', component: u_search },
    { path: '/u_summary', component: u_summary },
    { path: '/u_profile', component: u_profile },
    { path: '/a_search', component: a_search },
    { path: '/a_summary', component: a_summary },
]

const router = new VueRouter({
    routes  //routes : routes
})


const app = new Vue({
    el: '#app',
    router, //router : router
    template: `
    
   
    <div class="container">
        <nav-bar :loggedIn = 'loggedIn' :role='role' @logout="handleLogout"></nav-bar>
        <router-view :role='role' :loggedIn = 'loggedIn'  @login="handleLogin"></router-view>
        <foot></foot>
    </div>
    `,
    data: {
        loggedIn: localStorage.getItem('auth_token'),
        role: localStorage.getItem('role')
},
components:{
    "nav-bar": navbar,
    "foot": footer
    },
    methods:{
        handleLogout(){
            this.loggedIn = false
            this.$router.push('/');
        },
        handleLogin(){
            this.loggedIn = true
            this.role = localStorage.getItem('role')
        }
    }


})
