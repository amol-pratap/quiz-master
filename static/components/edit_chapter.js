export default {
    template: `
        <div class="container">
            <h2 class="text-center">Edit Chapter</h2>
            <form @submit.prevent="updateChapter">
                <div class="mb-3">
                    <label class="form-label">Chapter Title</label>
                    <input type="text" class="form-control" v-model="chapter.title" required>
                </div>
                <button type="submit" class="btn btn-success">Update Chapter</button>
            </form>
        </div>
    `,
    data() {
        return {
            chapter: {}
        };
    },
    methods: {
        fetchChapter() {
            fetch(`/api/chapter/${this.$route.params.chapter_id}`, {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            })
            .then(res => res.json())
            .then(data => this.chapter = data);
        },
        updateChapter() {
            fetch(`/api/chapter/${this.$route.params.chapter_id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify(this.chapter)
            }).then(response => {
                if (!response.ok) {  
                    return response.json().then(err => { throw new Error(err.error || alert("You can not update chapter!") && "Update failed"); });
                    
                }
                return response.json();  
            })
            .then(() => alert("Chapter Updated Successfully!"));
           
            this.$router.go(-1);
        }
    },
    mounted() {
        this.fetchChapter();
    }
}
