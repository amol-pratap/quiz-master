// edit_question.js
export default {
    template: `
        <div class="container">
            <h2 class="text-center">Edit Question</h2>
            <form @submit.prevent="updateQuestion">
                <!-- Question Text -->
                <div class="mb-3">
                    <label class="form-label">Question Text</label>
                    <textarea class="form-control" v-model="question.text" :value="question.text" required></textarea>
                </div>

                <!-- Options (Fixed 4) with Radio Buttons -->
                <div class="mb-3">
                    <label class="form-label">Options</label>
                    <div v-for="(option, index) in question.options" :key="index" class="input-group mb-2">
                        <div class="input-group-text">
                            <input type="radio" v-model="question.correct_answer" :value="option" required>
                        </div>
                        <input type="text" class="form-control" v-model="question.options[index]" required>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-success">Update Question</button>
            </form>
        </div>
    `,
    data() {
        return {
            question: {
                text: "",
                options: ["", "", "", ""], // Exactly 4 options
                correct_answer: ""
            }
        };
    },
    methods: {
        // Fetch question details from API
        fetchQuestion() {
            fetch(`/api/question/${this.$route.params.id}`, {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            })
            .then(res => res.json())
            .then(data => {
                this.question.text = data.text;
                this.question.options = data.options.slice(0, 4); // Ensure exactly 4 options
                this.question.correct_answer = data.correct_answer;
            })
            .catch(err => console.error("Error fetching question:", err));
        },

        // Update question via API
        updateQuestion() {
            fetch(`/api/question/${this.$route.params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.question)
            })
            .then(response => {
                if (response.ok) {
                    alert("Question Updated Successfully!");
                    this.$router.push("/admin_dashboard"); // Redirect back
                } else {
                    alert("Failed to update question!");
                }
            })
            .catch(err => console.error("Error updating question:", err));
        }
    },
    mounted() {
        this.fetchQuestion();
    }
}
