export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center fw-bold text-primary">Overall Quiz Summary</h2>

        <!-- Table -->
        <div v-if="summary.length" class="table-responsive mt-4">
            <table class="table table-hover table-striped text-center">
                <thead class="table-dark">
                    <tr>
                        <th> Subject</th>
                        <th> Chapter</th>
                        <th> Quiz Name</th>
                        <th>No. of Attempts</th>
                        <th> Best Score</th>
                        <th> Average Score</th>
                        <th> Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="quiz in summary" :key="quiz.quiz_id">
                        <td class="fw-bold">{{ quiz.subject_name }}</td>
                        <td>{{ quiz.chapter_title }}</td>
                        <td class="text-primary fw-bold">{{ quiz.quiz_title }}</td>
                        <td class="fw-bold text-info">{{ quiz.attempts }}</td>
                        <td class="fw-bold text-success">
                            {{ quiz.best_score }} / {{ quiz.total_questions * 4 }}
                        </td>
                        <td class="fw-bold text-warning">
                            {{ quiz.total_score / quiz.attempts }} / {{ quiz.total_questions * 4 }}
                        </td>
                        <td>
                            <router-link :to="'/score/' + quiz.quiz_id" class="btn btn-outline-info btn-sm">
                                📜 View Attempts
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- No Attempts Message -->
        <div v-else class="text-center text-muted mt-4">
            <p class="fs-5">😕 No quizzes attempted yet.</p>
        </div>
    </div>
    `,

    data() {
        return {
            summary: []
        };
    },

    methods: {
        fetchUserSummary() {
            fetch(`/api/user_summary`, {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                this.summary = data.summary || [];
            })
            .catch(error => console.error("Error fetching user summary:", error));
        }
    },

    mounted() {
        this.fetchUserSummary();
    }
};
