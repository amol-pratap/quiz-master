export default {
    template: `
    <div>
        <h2 class="text-center my-3">Chapter: {{chapter_title}}</h2>

        <div class="row">
            <!-- Quiz List -->
            <div v-for="quiz in quizzes" :key="quiz.id" class="col-md-4 mb-3">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <span>{{ quiz.title }}</span>
                        <div>
                            <button @click="editQuiz(quiz.id)" class="btn btn-warning btn-sm me-2">✏️ Edit</button>
                            <button @click="deleteQuiz(quiz.id)" class="btn btn-danger btn-sm">❌ Delete</button>
                        </div>
                    </div>

                    <div class="card-body">
                        <p>{{ quiz.description }}</p>

                        <!-- Headers for Question Section -->
                        <h6 class="text-muted mb-2">Questions:</h6>
                        <div class="row fw-bold mb-2">
                            <div class="col-8">Question</div>
                            <div class="col-4">Action</div>
                        </div>

                        <!-- Question List with Actions -->
                        <div v-for="question in quiz.questions" :key="question.id" class="row align-items-center mb-2">
                            <div class="col-8">{{ question.text }}</div>
                            <div class="col-4">
                                <button @click="editQuestion(question.id)" class="btn btn-outline-warning btn-sm me-1">✏️</button>
                                <button @click="deleteQuestion(question.id)" class="btn btn-outline-danger btn-sm">❌</button>
                            </div>
                        </div>

                        <div class="mt-3 text-center">
                            <router-link :to="'/add_question/' + quiz.id" class="btn btn-success btn-sm w-100">
                                ➕ Add Question
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add New Quiz Card -->
            <div class="row justify-content-center">
            <div class="col-md-4 mb-3 mx-auto text-center">
                <div class="card border-primary shadow-sm">
                    <div class="card-body text-center">
                        <h4 class="text-primary">➕ Add New Quiz</h4>
                        <router-link :to="'/add_quiz/' + chapter_id" class="btn btn-outline-primary w-100">
                            Add Quiz
                        </router-link>
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>`,

    data() {
        return {
            quizzes: [],
            chapter_id: this.$route.params.chapter_id, // Get chapter_id from URL
            chapter_title: "" // To display the chapter title dynamically
        }
    },

    methods: {
        fetchQuizzes() {      //To display all quizess and their quetions
            fetch(`/api/quizzes?chapter_id=${this.chapter_id}`, {
                headers: {
                    "Authentication-Token": localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.quizzes = data.quizzes;
                this.chapter_title = data.chapter_title; // Display chapter title
            })
            .catch(error => console.error("Error fetching quizzes:", error));
        },

        editQuiz(id) {
            this.$router.push(`/edit_quiz/${id}`);
        },

        deleteQuiz(id) {
            if (confirm("Are you sure you want to delete this quiz?")) {
                fetch(`/api/quiz/${id}`, {
                    method: 'DELETE',
                    headers: {
                        "Authentication-Token": localStorage.getItem('auth_token')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        alert("Quiz deleted successfully!");
                        this.fetchQuizzes();
                    } else {
                        alert("Failed to delete quiz.");
                    }
                })
                .catch(error => console.error("Error deleting quiz:", error));
            }
        },

        editQuestion(id) {
            this.$router.push(`/edit_question/${id}`);
        },

        deleteQuestion(id) {
            if (confirm("Are you sure you want to delete this question?")) {
                fetch(`/api/question/${id}`, {
                    method: 'DELETE',
                    headers: {
                        "Authentication-Token": localStorage.getItem('auth_token')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        alert("Question deleted successfully!");
                        this.fetchQuizzes();
                    } else {
                        alert("Failed to delete question.");
                    }
                })
                .catch(error => console.error("Error deleting question:", error));
            }
        }
    },

    mounted() {
        this.fetchQuizzes();
    }
}
