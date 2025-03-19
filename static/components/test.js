// add_quiz.js
export default {
    template: `
    <div>
        <h2 class="text-center my-3">Add New Quiz</h2>

        <div class="card shadow-sm">
            <div class="card-body">
                <!-- Quiz Title -->
                <div class="mb-3">
                    <label for="quizTitle" class="form-label">Quiz Title</label>
                    <input type="text" id="quizTitle" v-model="quiz.title" class="form-control" placeholder="Enter quiz title" required />
                </div>

                <!-- Quiz Description -->
                <div class="mb-3">
                    <label for="quizDescription" class="form-label">Description</label>
                    <textarea id="quizDescription" v-model="quiz.description" class="form-control" rows="3" placeholder="Enter quiz description"></textarea>
                </div>

                <!-- Question List -->
                <h5 class="text-muted mb-2">Questions:</h5>
                <div v-for="(question, index) in quiz.questions" :key="index" class="border p-3 mb-2">
                    <label class="form-label">Question {{ index + 1 }}</label>
                    <input type="text" v-model="question.text" class="form-control mb-2" placeholder="Enter question text" required />

                    <!-- Options -->
                    <div v-for="(option, optIndex) in question.options" :key="optIndex" class="mb-2">
                        <input type="text" v-model="question.options[optIndex]" class="form-control" placeholder="Enter option {{ optIndex + 1 }}" required />
                    </div>

                    <label class="form-label mt-2">Correct Answer (1-4)</label>
                    <input type="number" v-model="question.correct_answer" class="form-control" min="1" max="4" required />

                    <button @click="removeQuestion(index)" class="btn btn-outline-danger btn-sm mt-2">🗑️ Remove Question</button>
                </div>

                <!-- Add Question Button -->
                <button @click="addQuestion" class="btn btn-outline-primary btn-sm w-100 mt-3">➕ Add Another Question</button>

                <!-- Submit Button -->
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
                        correct_answer: 1
                    }
                ]
            },
            chapter_id: ''
        };
    },

    methods: {
        addQuestion() {
            this.quiz.questions.push({
                text: '',
                options: ['', '', '', ''],
                correct_answer: 1
            });
        },

        removeQuestion(index) {
            this.quiz.questions.splice(index, 1);
        },

        submitQuiz() {
            this.chapter_id = this.$route.params.chapter_id;

            fetch(`/api/quiz`, {
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
    }
}




//Router for add_quiz.js