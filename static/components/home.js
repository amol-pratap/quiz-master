export default {
    template: `
        <div class="container">
            
            <h2> welcome {{userData.username}}  </h2>
            <h4 class="text-center bg-success text-white"> Choose any subject to give quiz </h4>
            <div class='mb-3'>
                
                <div class="row">
            <div v-for="subject in subjects" :key="subject.id" class="col-md-4 mb-3">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <span>{{ subject.name }}</span>
                        
                    </div>

                    <div class="card-body">
                        <p>{{ subject.description }}</p>

                        <!-- Headers for Chapter Section -->
                        <h6 class="text-muted mb-2">Chapters:</h6>
                        <div class="row fw-bold mb-2">
                            <div class="col-5">Chapter Name</div>
                            <div class="col-3">Quizzes</div>
                        </div>

                        <!-- Chapter List with Quiz Count & Actions -->
                        <div v-for="chapter in subject.chapters" :key="chapter.id" class="row align-items-center mb-2">
                            <router-link :to="'/u_quiz/' + chapter.id" class="col-5">{{ chapter.title }}</router-link>

                            <div class="col-3">{{ chapter.quiz_count }}</div>
                            
                        </div>

                        
                    </div>
                </div>
            </div>



            


        </div>


  


            </div>
            </div>`,

        data: function() {
            return {
                // username: localStorage.getItem('username'),
                userData: {},
                 subjects: []
                }
        },
        methods: {
            fetchuser() {
                fetch('/api/user',{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth_token')
                        }
                })
                .then(response => response.json())
                .then(data => {
                    
                    this.userData= data
                    console.log("data-------------",this.userData)
                })
                    
                    .catch(error => console.error("Error fetching user:", error));
            },
            fetchSubjects() {
                fetch('/api/subjects', {
                    method: 'GET',
                    headers: {
                        "Authentication-Token": localStorage.getItem('auth_token')
                    }
                })
                .then(response => response.json())
                .then(data => {
                    this.subjects = data;
                })
                .catch(error => {
                    console.error("Error fetching subjects:", error);
                });
            },
            editSubject(id) {
                this.$router.push(`/edit_subject/${id}`);
            }

    },

    mounted(){
        this.fetchuser();
        this.fetchSubjects();
    }

}



