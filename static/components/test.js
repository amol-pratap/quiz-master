export default {
    template: `
        <div class="container">
            <h2 class="text-center">Edit Question</h2>
            <form @submit.prevent="updateQuestion">
                <!-- Question Text -->
                <div class="mb-3">
                    <label class="form-label">Question Text</label>
                    <textarea class="form-control" v-model="question.text" required></textarea>
                </div>

                <!-- Options (Fixed 4) with Radio Buttons -->
                <div class="mb-3">
                    <label class="form-label">Options</label>
                    <div v-for="(option, index) in question.options" :key="index" class="input-group mb-2">
                        <div class="input-group-text">
                            <input type="radio" v-model="question.correct_option_id" :value="option.id" required>
                        </div>
                        <input type="text" class="form-control" v-model="option.text" required>
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-success">Update Question</button>
            </form>
        </div>
    `,

    data() {
        return {
            question_id: this.$route.params.question_id, 
            question: {
                id: "",
                text: "",
                correct_opt
            }
        };
    },

    methods: {
       
        fetchQuestion() {
            fetch(`/api/question/${this.question_id}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token") 
                }
            })
            .then(res => res.json())
            .then(data => {
                this.question = data;
            })
            .catch(err => console.error("Error fetching question:", err));
        },

        
        updateQuestion() {
            fetch(`/api/question/${this.$route.params.question_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.question)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || "Update failed");
                    });
                }
                return response.json();  
            })
            .then(data => {
                console.log("Update Response:", data);
                alert("Question Updated Successfully!");
                this.$router.go(-1); 
            })
            .catch(err => console.error("Error updating question:", err));
        }
    },

    mounted() {
        this.fetchQuestion();
    }
}
