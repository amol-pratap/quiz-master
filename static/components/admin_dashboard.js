export default {
    template: `
        <div class="container">
            <h1> Admin Dashboard</h1>
            <p>Welcome to Admin dashboard!</p>
            <router-link class="btn btn-success" to="/quizzes">Create Quizzes</router-link>
        </div>`,
        data() {
            return {
                quizzes: []
                }
                },
                
}

