export default {
    data() {
        return {
            email: '',
            password: '',
            error: ''
        };
    },
    methods: {
        async login() {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password
                })
            });
            if (response.ok) {
                this.$router.push('/home');
            } else {
                this.error = "Invalid login credentials";
            }
        }
    },
    template: `
        <div class="container">
            <h2>Login</h2>

            <p v-if="error" class="text-danger">{{ error }}</p>
            <form @submit.prevent="login">
                <div class="mb-3">
                    <label>Email</label>
                    <input type="email" v-model="email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Password</label>
                    <input type="password" v-model="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
        </div>
    `
};
