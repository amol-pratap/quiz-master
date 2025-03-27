export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center">Add New Chapter</h2>
        <p class="text-muted text-center">Subject: <strong>{{ subjectName }}</strong></p>

        <div class="card p-4 shadow-sm">
            <div class="mb-3">
                <label class="form-label">Chapter Name</label>
                <input type="text" v-model="chapter.name" class="form-control" placeholder="Enter Chapter Name" required />
            </div>

            <button @click="createChapter" class="btn btn-primary w-100">➕ Add Chapter</button>
        </div>
    </div>`,

    data() {
        return {
            chapter: {
                name: '',
                subject_id: this.$route.params.subject_id
            },
            subjectName: ""  
        };
    },

    methods: {
        fetchSubject() {
            fetch(`/api/subject/${this.chapter.subject_id}`, {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                this.subjectName = data.name;  
            })
            .catch(error => console.error("Error fetching subject:", error));
        },

        createChapter() {
            fetch('/api/chapter', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem('auth_token')
                },
                body: JSON.stringify(this.chapter)
            })
            .then(response => response.json())
            .then(() => {
                alert("✅ Chapter added successfully!");
                this.$router.go(-1);  
            })
            .catch(error => {
                console.error("Error adding chapter:", error);
                alert("❌ Error adding chapter!");
            });
        }
    },

    mounted() {
        this.fetchSubject();  
    }
};
