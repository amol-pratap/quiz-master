export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center">🔍 Search Quizzes</h2>

        <!-- Search Input & Filter -->
        <div class="d-flex justify-content-center gap-2 my-3">
            <select v-model="searchType" class="form-select w-auto">
                <option value="subject">By Subject</option>
                <option value="chapter">By Chapter</option>
                <option value="quiz">By Quiz Name</option>
            </select>
            <input type="text" v-model="searchQuery" class="form-control w-50" placeholder="Enter search keyword">
            <button @click="searchQuiz" class="btn btn-primary">🔍 Search</button>
        </div>

        <!-- Quiz Cards -->
        <div class="row mt-4">
            <div v-for="quiz in quizzes" :key="quiz.quiz_id" class="col-md-4 mb-4">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title text-primary fw-bold">{{ quiz.quiz_title }}</h5>
                        <p class="text-muted">{{ quiz.description }}</p>
                        <p><strong>📚 Subject:</strong> {{ quiz.subject_name }}</p>
                        <p><strong>📖 Chapter:</strong> {{ quiz.chapter_title }}</p>
                        <router-link :to="'/take_quiz/' + quiz.quiz_id" class="btn btn-success w-100">🎯 Attempt Quiz</router-link>
                    </div>
                </div>
            </div>
        </div>

        <!-- No Results Message -->
        <div v-if="quizzes.length === 0 && searched" class="text-center text-muted mt-3">
            <p>No quizzes found.</p>
        </div>
    </div>
    `,

    data() {
        return {
            searchQuery: '',
            searchType: 'subject', // Default search type
            quizzes: [],
            searched: false
        };
    },

    methods: {
        searchQuiz() {
            if (!this.searchQuery.trim()) {
                alert("Please enter a search keyword!");
                return;
            }

            fetch(`/api/search_quiz?query=${this.searchQuery}&type=${this.searchType}`, {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                this.quizzes = data.quizzes || [];
                this.searched = true;
            })
            .catch(error => console.error("Error searching quizzes:", error));
        }
    }
};
