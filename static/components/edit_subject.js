export default {
    template: `
        <div class="container">
            <h2 class="text-center">Edit Subject</h2>
            <form @submit.prevent="updateSubject">
                <div class="mb-3">
                    <label class="form-label">Subject Name</label>
                    <input type="text" class="form-control" v-model="subject.name" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" v-model="subject.description" required></textarea>
                </div>
                <button type="submit" class="btn btn-success">Update Subject</button>
            </form>
        </div>
    `,
    data() {
        return {
            subject: {}
        };
    },
    methods: {
        fetchSubject() {
            fetch(`/api/subject/${this.$route.params.id}`, {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            })
            .then(res => res.json())
            .then(data => this.subject = data);
        },
        updateSubject() {
            fetch(`/api/subject/${this.$route.params.id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.subject)
            }).then(() => alert("Subject Updated Successfully!"));
        }
    },
    mounted() {
        this.fetchSubject();
    }
}
