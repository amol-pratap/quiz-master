export default {
    template: `
    <div>
        <h2 class="text-center my-3">Add New Quiz</h2>
        
      
        <div class="alert alert-info text-center">
            <h5>Chapter: {{ chapter_name }}</h5>
        </div>

        <div class="card shadow-sm">
            <div class="card-body">
          
                <div class="mb-3">
                    <label for="quizTitle" class="form-label">Quiz Title</label>
                    <input type="text" id="quizTitle" v-model="quiz.title" class="form-control" placeholder="Enter quiz title" required />
                </div>

       
                <div class="mb-3">
                    <label for="quizDescription" class="form-label">Description</label>
                    <textarea id="quizDescription" v-model="quiz.description" class="form-control" rows="3" placeholder="Enter quiz description"></textarea>
                </div>

                <h5 class="text-muted mb-2">Questions:</h5>
                <div v-for="(question, qIndex) in quiz.questions" :key="qIndex" class="border p-3 mb-2">
                    <label class="form-label">Question {{ qIndex + 1 }}</label>
                    <textarea v-model="question.text" class="form-control mb-2 bg-primary text-dark bg-gradient p-3" placeholder="Enter question text" required></textarea>

       
                    <div class="mb-3">
                        <div v-for="(option, optIndex) in question.options" :key="optIndex" class="input-group mb-2">
                            <input type="text" v-model="question.options[optIndex]" class="form-control bg-info text-white bg-gradient p-3" placeholder="Enter option" required />

                            <div class="input-group-text bg-secondary text-white bg-gradient p-3">
                               
                                <input type="radio" :name="'correct_option_' + qIndex" :value="optIndex" v-model="question.correct_answer" required>
                                <label class="ms-2">Correct</label>
                            </div>
                        </div>
                    </div>

                    <button @click="removeQuestion(qIndex)" class="btn btn-outline-danger btn-sm mt-2">🗑️ Remove Question</button>
                </div>

              
                <button @click="addQuestion" class="btn btn-outline-primary btn-sm w-100 mt-3">➕ Add Another Question</button>

         
                <button @click="submitQuiz" class="btn btn-success w-100 mt-3">Submit Quiz</button>
            </div>
        </div>
    </div>`,

    data() {
        return {
            quiz: {
                title: '',
                description: '',
                questions: [
                    {
                        text: '',
                        options: ['', '', '', ''],
                        correct_answer: null  
                    }
                ]
            },
            chapter_id: this.$route.params.chapter_id,  
            chapter_name: "" 
        };
    },

    methods: {
        fetchChapter() {
            fetch(`/api/chapter/${this.chapter_id}`, { 
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                this.chapter_name = data.title;  
            })
            .catch(error => console.error("Error fetching chapter:", error));
        },

        addQuestion() {
            this.quiz.questions.push({
                text: '',
                options: ['', '', '', ''],
                correct_answer: null 
            });
        },

        removeQuestion(index) {
            this.quiz.questions.splice(index, 1);
        },

        submitQuiz() {
            fetch(`/api/quizzes`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem('auth_token')
                },
                body: JSON.stringify({
                    ...this.quiz,
                    chapter_id: this.chapter_id
                })
            })
            .then(response => response.json())
            .then(data => {
                alert("Quiz added successfully!");
                this.$router.push(`/quiz/${this.chapter_id}`);
            })
            .catch(error => {
                console.error("Error adding quiz:", error);
                alert("Failed to add quiz.");
            });
        }
    },

    mounted() {
        this.fetchChapter();  
    }
}
