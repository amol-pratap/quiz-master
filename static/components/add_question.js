export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center">Add New Question</h2>
        
        <div class="card shadow-sm p-4">
            <div v-if="message" class="alert alert-info text-center">{{ message }}</div>

      
            <div class="mb-3">
                <label for="question_text" class="form-label">Question</label>
                <textarea id="question_text" v-model="question.text" class="form-control bg-primary text-white bg-gradient p-3" rows="3" placeholder="Enter your question here" required></textarea>
            </div>

         
            <div class="mb-3">
                <label class="form-label">Options</label>
                <div v-for="(option, index) in question.options" :key="index" class="input-group mb-2">
                    <input type="text" class="form-control bg-info text-white bg-gradient p-3" v-model="option.text" placeholder="Option " required>
                    <div class="input-group-text bg-secondary text-white bg-gradient p-3">
                        <input type="radio" name="correct_option" :value="index" v-model="question.correct_option" required>
                        <label class="ms-2">Correct</label>
                    </div>
                </div>
            </div>

     
            <button @click="submitQuestion" class="btn btn-primary w-100">Submit Question</button>
        </div>
    </div>`,

    data() {
        return {
            quiz_id: this.$route.params.quiz_id,
            question: {
                text: '',
                options: [
                    { text: '' },
                    { text: '' },
                    { text: '' },
                    { text: '' }
                ],
                correct_option: null 
            },
            message: ''
        };
    },

    methods: {
       

        submitQuestion() {
            if (!this.question.text || this.question.correct_option === null) {
                alert("Please fill all fields and select the correct answer!");
                return;
            }

            fetch(`/api/add_question/${this.quiz_id}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem('auth_token')
                },
                body: JSON.stringify(this.question)
            })
            .then(response => response.json())
            .then(data => {
                this.message = data.message;
                if (data.success) {
                    setTimeout(() => {
                        this.$router.go(-1);
                    }, 500); 
                }
            })
            .catch(error => console.error("Error submitting question:", error));
        }
    }
}
