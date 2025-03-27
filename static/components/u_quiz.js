export default {
    template: `
    <div class="container-fluid min-vh-100 d-flex flex-column align-items-center bg-dark text-white py-5">
        <p class="text-center "><strong>{{ subject_name }}</strong></p>
        <h2 class="text-center mb-4 fw-bold text-warning display-4">📚 {{ chapter_title }}</h2>

        <div class="container">
            <div class="row justify-content-center">
                <div v-for="quiz in quizzes" :key="quiz.id" class="col-md-4 mb-4">
                    <div class="card shadow-lg border-0 rounded-4 overflow-hidden" 
                         style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); backdrop-filter: blur(15px);">

                        <!-- Animated Gradient Header -->
                        <div class="card-header text-center fw-bold text-white py-3"
                             style="background: linear-gradient(135deg, #ff416c, #ff4b2b); border-bottom: 4px solid rgba(255,255,255,0.2);">
                            {{ quiz.title }}
                        </div>

                        <div class="card-body d-flex flex-column text-center text-light">
                            <p class="text-white-50 px-3">{{ quiz.description }}</p>

                            <div class="mt-auto">
                                <router-link :to="'/take_quiz/' + quiz.id" 
                                             class="btn btn-lg fw-bold w-100 text-dark"
                                             style="background: linear-gradient(135deg, #ff9a9e, #fad0c4); border-radius: 30px; box-shadow: 0px 4px 10px rgba(255, 154, 158, 0.4);">
                                    📝 Attempt Quiz
                                </router-link>
                            </div>
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
            chapter_title: "" 
        };
    },

    methods: {
        fetchQuizzes() {
            fetch(`/api/quizzes?chapter_id=${this.chapter_id}`, {
                headers: {
                    "Authentication-Token": localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.quizzes = data.quizzes;
                this.chapter_title = `Chapter: ${data.chapter_title}`; 
                this.subject_name = `Subject: ${data.subject_name}`; 
            })
            .catch(error => console.error("Error fetching quizzes:", error));
        }
    },

    mounted() {
        this.fetchQuizzes();
    }
}
