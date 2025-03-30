export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center"> Quiz Summary</h2>

        <div v-if="quiz_title">
            <p class="text-center text-muted"> Subject: <strong>{{ subject_name }}</strong> |  Chapter: <strong>{{ chapter_name }}</strong></p>
            <h3 class="text-center text-primary fw-bold">{{ quiz_title }}</h3>

            <div v-if="attempts.length">
                <h5 class="mt-4"> Your Attempts:</h5>

                <div class="table-responsive">
                    <table class="table table-hover table-striped text-center">
                        <thead class="table-dark">
                            <tr>
                                <th>Attempt No.</th>
                                <th>Total Qs</th>
                                <th> Correct</th>
                                <th> Incorrect</th>
                                <th> Unattempted</th>
                                <th> Total Marks</th>
                                <th> Obtained</th>
                                <th>% Score</th>
                                <th> Time</th>
                                <th> Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(attempt, i) in attempts">
                                <tr :key="attempt.attempt_id">
                                    <td class="fw-bold">{{ attempts.length - i }}</td>
                                    <td>{{ attempt.total_questions }}</td>
                                    <td class="text-success fw-bold">{{ attempt.correct }}</td>
                                    <td class="text-danger fw-bold">{{ attempt.incorrect }}</td>
                                    <td class="text-warning fw-bold">{{ attempt.unattempted }}</td>
                                    <td>{{ attempt.total_marks }}</td>
                                    <td class="fw-bold">{{ attempt.obtained_marks }}</td>
                                    <td :class="attempt.percentage >= 50 ? 'text-success' : 'text-danger'">
                                        {{ attempt.percentage }}%
                                    </td>
                                    <td>{{ attempt.time_taken }} </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-info" @click="toggleAttempt(i, attempt.attempt_id)">
                                            {{ activeAttempt === i ? "🔽 Collapse" : "🔼 Expand" }}
                                        </button>
                                    </td>
                                </tr>

                         
                                <tr v-if="activeAttempt === i" :key="'details-' + attempt.attempt_id">
                                    <td colspan="10">
                                        <div class="accordion" id="attemptDetails">
                                            <div class="accordion-item">
                                                <h2 class="accordion-header">
                                                    <button class="accordion-button bg-light text-dark fw-bold" type="button" 
                                                        data-bs-toggle="collapse" 
                                                        :data-bs-target="'#collapse' + attempt.attempt_id" 
                                                        aria-expanded="true">
                                                         View Attempt Details
                                                    </button>
                                                </h2>
                                                <div :id="'collapse' + attempt.attempt_id" class="accordion-collapse collapse show">
                                                    <div class="accordion-body">
                                                        <div v-if="responses[attempt.attempt_id] && responses[attempt.attempt_id].length">
                                                            <div v-for="(response, j) in responses[attempt.attempt_id]" :key="j" class="border rounded p-3 mb-3 shadow-sm">
                                                                <p class="fw-bold">Q{{ j + 1 }}: {{ response.question_text }}</p>
                                                                <p class="text-primary"><strong> Correct Answer:</strong> {{ response.correct_option }}</p>
                                                                <p :class="response.selected_option !== response.correct_option ? 'text-danger' : 'text-success'">
                                                                    <strong> Your Answer:</strong> 
                                                                    {{ response.selected_option ? response.selected_option : "Unattempted" }}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div v-else>
                                                            <p class="text-muted"> Loading attempt details...</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-else>
                <p class="text-center text-muted">No attempts yet.</p>
            </div>
        </div>

        <div v-else>
            <p class="text-center text-muted">⏳ Loading quiz summary...</p>
        </div>
    </div>`,

    data() {
        return {
            quiz_title: "",
            attempts: [],
            responses: {},
            activeAttempt: null
        };
    },

    methods: {
        fetchQuizSummary() {
            fetch(`/api/quiz_summary/${this.$route.params.quiz_id}`, {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error fetching quiz summary:", data.error);
                } else {
                    this.quiz_title = data.quiz_title || "Unknown Quiz";
                    this.subject_name = data.subject_name || "Unknown Subject";
                    this.chapter_name = data.chapter_name || "Unknown Chapter";  
                    this.attempts = Array.isArray(data.attempts) 
                        ? data.attempts.sort((a, b) => b.attempt_id - a.attempt_id) 
                        : [];
                }
            })
            .catch(error => console.error("Error fetching quiz summary:", error));
        },

        toggleAttempt(i, attempt_id) {
            if (this.activeAttempt === i) {
                this.activeAttempt = null;
            } else {
                this.activeAttempt = i;
                this.fetchAttemptResponses(attempt_id);
            }
        },

        fetchAttemptResponses(attempt_id) {
            if (!attempt_id) {
                console.error("Invalid attempt_id:", attempt_id);
                return;
            }

            fetch(`/api/attempt_responses/${attempt_id}`, {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error fetching attempt responses:", data.error);
                } else {
                    this.$set(this.responses, attempt_id, data.responses);
                }
            })
            .catch(error => console.error("Error fetching attempt responses:", error));
        }
    },

    mounted() {
        this.fetchQuizSummary();
    }
};
