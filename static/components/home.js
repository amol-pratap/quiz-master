export default {
    template: `
        <div class="container">
            <h1>Dashboard</h1>
            <h2> Welcome {{username}} </h2>
            <h3> welcome {{userData.username}} </h3>
            <p>{{userData.email}}, {{email}} Welcome to your dashboard! Here you can see available quizzes and your progress.</p>
            <router-link class="btn btn-success" to="/create_quiz">View Quizzes</router-link>
        
            <div class='mb-3'>

            <p> hh  </p>

            </div
            </div>`,

        data: function() {
            return {
                username: localStorage.getItem('username'),
                userData: ""
                }
        },
        mounted() {
            fetch('/api/user',{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization-Token': localStorage.getItem('auth_token')
                    }
            })
            .then(response => response.json())
            .then(data => {
                console.log("data-------",data),
                this.userData= data}),
                console.log("data-------------",userData)
        }

}



