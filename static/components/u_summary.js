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
                            {{ (quiz.total_score / quiz.attempts).toFixed(2) }} / {{ quiz.total_questions * 4 }}
                        </td>
                        <td>
                            <router-link :to="'/score/' + quiz.quiz_id" class="btn btn-outline-info btn-sm">
                                📜 View Attempts
                            </router-link>
                            <button @click="csvExport(quiz.quiz_id)" class="btn btn-secondary btn-sm">⬇ Download CSV</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- No Attempts Message -->
        <div v-else class="text-center text-muted mt-4">
            <p class="fs-5">😕 No quizzes attempted yet.</p>
        </div>

        <!-- Chart Section -->
        <div class="container mt-4 text-center">
            <h2 class="text-primary">📊 Subject-wise Quiz Attempts</h2>
            <div class="d-flex justify-content-center">
                <div class="w-50">
                    <canvas id="quizAttemptsChart"></canvas>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            summary: [],
            attemptsData: [],
            chart: null
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
        },

        async fetchQuizAttempts() {
            try {
                const response = await fetch('/api/user/quiz_attempts', {
                    headers: { "Authentication-Token": localStorage.getItem('auth_token') }
                });
                const data = await response.json();
                this.attemptsData = data;
                this.renderChart();
            } catch (error) {
                console.error("Error fetching quiz attempts:", error);
            }
        },

        renderChart() {
            const ctx = document.getElementById("quizAttemptsChart").getContext("2d");

            // Destroy previous chart instance if exists
            if (this.chart) this.chart.destroy();

            this.chart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: this.attemptsData.map(item => item.subject),
                    datasets: [{
                        label: "No. of Attempts",
                        data: this.attemptsData.map(item => item.attempts),
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        },

        csvExport(quiz_id) {
            fetch(`/api/export/${quiz_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                window.location.href = `/api/csv_result/${data.id}`;
            });
        }
    },

    mounted() {
        this.fetchUserSummary();
        this.fetchQuizAttempts();
    }
};
