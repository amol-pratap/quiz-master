export default {
    props: ['role','loggedIn'],
    template: `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <div class="col-10">
                    <router-link v-if="role === 'admin'" class="navbar-brand" to="/admin_dashboard"> Quiz Master  </router-link>
                    <router-link v-if="role === 'admin'"  to="/admin_dashboard"> HOME </router-link>

                    <router-link v-if="role === 'user'" class="navbar-brand" to="/home"> Quiz Master   </router-link>
                     <router-link v-if="role === 'user'" to="/home"> HOME </router-link>  

                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                </div>    
                    

                <div class="navbar-nav d-flex align-items-center gap-2">
                                <router-link v-if="role === 'admin'" class="nav-link" to="/a_summary">Summary</router-link>
                                <router-link v-if="role === 'admin'" class="nav-link" to="/a_search">Search</router-link>

                                <router-link v-if="role === 'user'" class="nav-link" to="/u_summary">Summary</router-link>
                                <router-link v-if="role === 'user'" class="nav-link" to="/u_search">Search</router-link>

                                <router-link v-if="!loggedIn" class="btn btn-primary" to="/login">Login </router-link>
                                <router-link v-if="!loggedIn" class="btn btn-secondary" to="/sign_up">Sign Up</router-link>
                                <button v-if="loggedIn" @click="logoutUser" class="btn btn-danger">Logout </button>
                    
                </div>
                
                    
            </div>

            </br>
            
            
            
        </nav>
    `,

    data: function(){
        return {
            // loggedIn: localStorage.getItem('auth_token'),
            // role: localStorage.getItem('role') || 'st'
            username: localStorage.getItem('username')
        }
    },
    methods:{
        logoutUser(){
            localStorage.clear()
           
            this.$emit('logout')
            this.$router.go('/')
            this.$router.push('/')
        }
    }



};
