export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center text-primary">📊 Admin Summary</h2>

        <div v-if="summary">
            <!-- Summary Cards -->
            <div class="row mt-4">
                <div class="col-md-4 mb-3" v-for="(value, key) in generalSummary" :key="key">
                    <div class="card shadow-sm">
                        <div class="card-body text-center">
                            <h5 class="card-title text-uppercase text-muted">{{ formatKey(key) }}</h5>
                            <h3 class="fw-bold text-primary">{{ value }}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Performance Table -->
            <h3 class="mt-5 text-center text-secondary">📚 Quiz Performance Summary</h3>
            <div class="table-responsive mt-3">
                <table class="table table-striped text-center">
                    <thead class="table-dark">
                        <tr>
                            <th>📖 Subject</th>
                            <th>📚 Chapter</th>
                            <th>📝 Quiz</th>
                            <th>🔄 Total Attempts</th>
                            <th>👥 Unique Users</th>
                            <th>🏆 Best Score</th>
                            <th>📊 Average Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="quiz in summary.quiz_summary" :key="quiz.quiz_id">
                            <td class="fw-bold">{{ quiz.subject_name }}</td>
                            <td>{{ quiz.chapter_title }}</td>
                            <td class="text-primary fw-bold">{{ quiz.quiz_title }}</td>
                            <td class="fw-bold text-info">{{ quiz.total_attempts }}</td>
                            <td class="fw-bold text-warning">{{ quiz.unique_users_attempted }}</td>
                            <td class="fw-bold text-success">{{ quiz.best_score }}/{{quiz.total_questions * 4}}</td>
                            <td class="fw-bold text-danger">{{ quiz.average_score }}/{{quiz.total_questions * 4}} </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-else class="text-center mt-5">
            <p class="fs-5 text-muted">⏳ Loading summary data...</p>
        </div>
    </div>
    `,

    data() {
        return {
            summary: null
        };
    },

    computed: {
        generalSummary() {
            if (!this.summary) return {};
            return {
                "Total Users": this.summary.total_users,
                "Total Subjects": this.summary.total_subjects,
                "Total Chapters": this.summary.total_chapters,
                "Total Quizzes": this.summary.total_quizzes,
                "Total Attempts": this.summary.total_attempts,
                "Unique Users Attempted": this.summary.unique_users_attempted
            };
        }
    },

    methods: {
        fetchSummary() {
            fetch("/api/admin_summary", {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                this.summary = data;
            })
            .catch(error => console.error("Error fetching summary:", error));
        },

        formatKey(key) {
            return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        }
    },

    mounted() {
        this.fetchSummary();
    }
};
