export default {
    template: `
    <div class="container mt-4">
        <p class="text-center text-muted">📘 Subject: <strong>{{ subject_name }}</strong> | 📖 Chapter: <strong>{{ chapter_name }}</strong></p>
        <h2 class="text-center">Quiz: {{ quiz.title }}</h2>
        <p class="text-center text-muted">⏳ Time Remaining: {{ formattedTime }}</p>

        <div class="row">
            <!-- Main Quiz Section -->
            <div class="col-md-8">
                <div v-if="currentQuestion" class="card shadow-sm p-4">
                    <h5>Q{{ currentIndex + 1 }}: {{ currentQuestion.text }}</h5>
                    
                    <div class="d-flex flex-column">
                        <div class="form-check d-flex align-items-center" v-for="option in currentQuestion.options" :key="option.id">
                            <input class="form-check-input me-2" type="radio" :value="option.id" v-model="selectedAnswers[currentQuestion.id]">
                            <label class="form-check-label flex-grow-1">{{ option.text }}</label>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end">
                        <button class="btn btn-sm btn-warning mt-2 px-3" @click="clearAnswer"> Clear</button>
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="d-flex justify-content-between mt-3">
                    <button class="btn btn-secondary btn-sm px-4" @click="prevQuestion">⬅ Previous</button>
                    <button class="btn btn-primary btn-sm px-4" @click="saveAndNext"> Save & Next</button>
                    <button class="btn btn-secondary btn-sm px-4" @click="nextQuestion">Next ➡</button>
                </div>

                <!-- Submit Button -->
                <div class="text-center mt-3">
                    <button class="btn btn-success btn-lg px-5" @click="submitQuiz">✅ Submit</button>
                </div>
            </div>

            <!-- Question Navigation Panel -->
            <div class="col-md-4">
                <div class="card p-3 shadow-sm">
                    <h5 class="text-center text-primary"> Navigate Questions</h5>
                    <div class="d-flex flex-wrap justify-content-center">
                        <button 
                            v-for="(q, index) in questions" 
                            :key="index" 
                            class="btn btn-sm mx-1 my-1"
                            :class="{'btn-primary': currentIndex === index, 'btn-outline-secondary': currentIndex !== index}"
                            @click="jumpToQuestion(index)"
                        >
                            {{ index + 1 }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    data() {
        return {
            quiz: {},
            questions: [],
            currentIndex: 0,
            selectedAnswers: {}, 
            timer: null,
            timeRemaining: 0,
            startTime: null // ✅ Store quiz start time
        };
    },

    computed: {
        currentQuestion() {
            return this.questions[this.currentIndex] || null;
        },
        formattedTime() {
            let minutes = Math.floor(this.timeRemaining / 60);
            let seconds = this.timeRemaining % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    },

    methods: {
        fetchQuiz() {
            fetch(`/api/take_quiz/${this.$route.params.quiz_id}`, {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                this.quiz = data;
                this.subject_name = data.subject_name || "Unknown Subject";
                this.chapter_name = data.chapter_name || "Unknown Chapter"; 
                this.questions = data.questions;
                this.timeRemaining = this.questions.length * 4 * 60; // Timer = 4 mins per question
                this.startTime = Date.now();  // ✅ Save start time in milliseconds
                this.startTimer();
            })
            .catch(error => console.error("Error fetching quiz:", error));
        },

        startTimer() {
            this.timer = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    clearInterval(this.timer);
                    this.submitQuiz(); // ✅ Auto-submit on timeout
                }
            }, 1000);
        },

        prevQuestion() {
            this.currentIndex = (this.currentIndex - 1 + this.questions.length) % this.questions.length;
        },

        nextQuestion() {
            this.currentIndex = (this.currentIndex + 1) % this.questions.length;
        },

        saveAndNext() {
            this.nextQuestion();
        },

        clearAnswer() {
            this.selectedAnswers[this.currentQuestion.id] = null;
        },

        jumpToQuestion(index) {
            this.currentIndex = index;
        },

        submitQuiz() {
            clearInterval(this.timer);
            const endTime = Date.now();
            const timeTaken = Math.floor((endTime - this.startTime) / 1000); // ✅ Calculate time taken in seconds

            fetch(`/api/submit_quiz/${this.$route.params.quiz_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem('auth_token')
                },
                body: JSON.stringify({ 
                    answers: this.selectedAnswers,
                    time_taken: timeTaken // ✅ Send time taken to backend
                })
            })
            .then(response => response.json())
            .then(data => {
                alert("Quiz submitted successfully!");
                this.$router.push(`/score/${this.$route.params.quiz_id}`);
            })
            .catch(error => console.error("Error submitting quiz:", error));
        }
    },

    mounted() {
        this.fetchQuiz();
    }
};
