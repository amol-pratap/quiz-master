export default {
    template: `
        <div class="container">
            <h2 class="text-center">Edit Quiz</h2>
            <form @submit.prevent="updateQuiz">
                <div class="mb-3">
                    <label class="form-label">Quiz Title</label>
                    <input type="text" class="form-control" v-model="quiz.title" required>
                </div>
                <button type="submit" class="btn btn-success">Update Quiz</button>
            </form>
        </div>
    `,
    data() {
        return {
            quiz: {}
        };
    },
    methods: {
        fetchQuiz() {
            fetch(`/api/quiz/${this.$route.params.quiz_id}`, {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            })
            .then(res => res.json())
            .then(data => this.quiz = data);
        },
        updateQuiz() {
            fetch(`/api/quiz/${this.$route.params.quiz_id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.quiz)
            }).then(response => {
                if (!response.ok) {  
                    return response.json().then(err => { throw new Error(err.error || alert("You can not update quiz!") && "Update failed"); });
                    
                }
                return response.json();  
            })
            .then(() => alert("Quiz Updated Successfully!"));
            this.$router.go(-1);
        }
    },
    mounted() {
        this.fetchQuiz();
    }
}
