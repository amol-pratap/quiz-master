export default {
    data() {
        return {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            error: ''
        };
    },
    methods: {
        async register() {
            if (this.password !== this.confirmPassword) {
                this.error = "Passwords do not match";
                return;
            }
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.email,
                    username: this.username,
                    password: this.password
                })
            });
            if (response.ok) {
                this.$router.push('/login');
            } else {
                this.error = "Failed to sign up";
            }
        }
    },
    template: `
        <div class="container">
            <h2>Sign Up</h2>
            <p v-if="error" class="text-danger">{{ error }}</p>
            <form @submit.prevent="register">
                <div class="mb-3">
                    <label>Email</label>
                    <input type="email" v-model="email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Username</label>
                    <input type="text" v-model="username" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Password</label>
                    <input type="password" v-model="password" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label>Confirm Password</label>
                    <input type="password" v-model="confirmPassword" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Sign Up</button>
            </form>
        </div>
    `
};
