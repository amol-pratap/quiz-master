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
import add_quiz from './components/add_quiz.js'
import add_question from './components/add_question.js'
import edit_subject from './components/edit_subject.js'
import edit_chapter from './components/edit_chapter.js'
import edit_quiz from './components/edit_quiz.js'
import edit_question from './components/edit_question.js'





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
    { path: '/quiz', component: quiz},
    { path: '/quiz/:chapter_id', name:'quiz', component: quiz},
    { path: '/add_quiz/:chapter_id', name:'add_quiz', component: add_quiz},
    { path: '/add_question/:quiz_id', name:'add_question', component: add_question},
    { path: '/edit_subject/:subject_id', name:'edit_subject', component: edit_subject},
    { path: '/edit_chapter/:chapter_id', name:'edit_chapter', component: edit_chapter},
    { path: '/edit_quiz/:quiz_id', name:'edit_quiz', component: edit_quiz},
    { path: '/edit_question/:question_id', name:'edit_question', component: edit_question}
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
