export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 750px;">
            <div class="border mx-auto mt-5" style="height: 500px; width: 300px;">
                <div class="ml-3 p-5">
                    <h2 class="text-center">Sign up Form</h2>
                    <div class="mb-2">
                        <label  for="email">Email:</label>  <br>
                        <input type="text" id="email" v-model="formData.email" placeholder="Enter your Email" required>
                    </div>
                    <div class="mb-2">
                        <label for="username"> NAME:</label>  <br>
                        <input type="text" id="username" v-model="formData.username" placeholder="Enter your Name" required>
                    </div>
                    <div class="mb-2">
                        <label for="qulification"> Qulification:</label>  <br>
                        <input type="text" id="qulification" v-model="formData.qulification" placeholder="Enter highest Qulification"  required>
                    </div>
                    <div class="mb-2">
                        <label for="pass">password:</label> <br>
                        <input type="password" id="pass" v-model="formData.password" placeholder="Create password" required>
                    </div>
                    <div>
                        <button center class="btn btn-primary" @click="addUser">Register</button>
                    <div>    Existing User ?  <router-link v-if="!loggedIn" class="btn btn-primary" to="/login">Login</router-link>   </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    data: function() {
        return {
            formData:{
                email: "",
                password: "",
                qulification: "",
                username: ""
            } 
        }
    },
    methods:{
        addUser: function(){
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(this.formData) // the content goes to backend as JSON string
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message)
                this.$router.push('/login')
            })

        }
    }
}