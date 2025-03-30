export default {
    template: `
    <div class="container mt-4">
        <h2>User Profile</h2>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
        <div v-if="user" class="card p-3">
    
            <p><strong>Username:</strong> {{ user.username }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
            <p><strong>Qualification:</strong> {{ user.qualification }}</p>
        </div>
    </div>
    `,
    data() {
        return {
            user: null,
            loading: true,
            error: null
        };
    },
    mounted() {
        this.fetchUserProfile();
    },
    methods: {
     fetchUserProfile()   
        {
        fetch(`/api/user_profile`, {
            method: 'GET',
            headers: { "Authentication-Token": localStorage.getItem('auth_token') }
        })
        .then(response => response.json())
        .then(data => {
            this.user = data;
            
        })
        
    },
            }
        
    
};
