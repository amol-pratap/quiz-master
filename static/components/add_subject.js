export default {
    template:`
    <div>
        <h2> New Subject </h2>
        <div class="">
           
            <div>  {{message}} </div>

                <div class="mb-3">
                    <label for="name" class="form-label">Subject Name</label>
                    <input type="text"id="name" v-model="subject.name" class="form-control" placeholder="Enter subject name" required />
                </div>

                <div class="mb-3">
                    <label for="description" class="form-label">  Description</label>
                    <textarea id="description" v-model="subject.description" class="form-control" rows="3" placeholder="Enter subject description"></textarea>
                </div>

                <button @click="create_subject" class="btn btn-primary w-100">Add Subject +</button>
        
        </div>

    </div>`,
    data: function(){
        return {
            subject: {
                name: '',
                description: ''
                },
                Message:""
            }
        },

        methods:{
            create_subject(){
            fetch('/api/subject',{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem('auth_token')
                },
                body: JSON.stringify(this.subject)
                })
                .then(response => response.json())
                .then(data =>{
                    console.log("Response Data:",data)
                    this.subjects = data
                    this.$router.push('/admin_dashboard')
                })
            }

            
        }
   
}