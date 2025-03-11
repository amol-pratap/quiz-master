export default {
    template:`
    <div>
        <h2> New Chapter </h2>
        <div class="">
           
            <div>  {{message}} </div>

                <div class="mb-3">
                    <label for="name" class="form-label">Chaptert Name</label>
                    <input type="text"id="name" v-model="chapter.name" class="form-control" placeholder="Enter Chapter name" required />
                </div>

               

                <button @click="create_chapter" class="btn btn-primary w-100">Add Chapter ➕ </button>
        
        </div>

    </div>`,
    data: function(){
        return {
            chapter: {
                name: '',
                subject_id: this.$route.params.subject_id
                },
                Message:""
            }
        },

        methods:{
            create_chapter(){
            fetch('/api/chapter',{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem('auth_token')
                },
                body: JSON.stringify(this.chapter)
                })
                .then(response => response.json())
                .then(data =>{
                    console.log("Response Data:",data)
                    this.chapters = data
                    this.$router.push('/admin_dashboard')
                })
            }

            
        }
   
}