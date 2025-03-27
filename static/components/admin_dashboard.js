export default {
    template: `
    <div>
         <h3> welcome {{username}}  </h3>
        <h2 class="text-center my-3">Subjects</h2>

               
        <div class="row">
            <div v-for="subject in subjects" :key="subject.id" class="col-md-4 mb-3">
                <div class="card shadow-sm">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <span>{{ subject.name }}</span>
                        <div>
                            <button @click="editSubject(subject.id)" class="btn btn-warning btn-sm me-2">✏️ Edit</button>
                            <button @click="deleteSubject(subject.id)" class="btn btn-danger btn-sm">❌ Delete</button>
                        </div>
                    </div>

                    <div class="card-body">
                        <p>{{ subject.description }}</p>

                        <!-- Headers for Chapter Section -->
                        <h6 class="text-muted mb-2">Chapters:</h6>
                        <div class="row fw-bold mb-2">
                            <div class="col-5">Chapter Name</div>
                            <div class="col-3">Quizzes</div>
                            <div class="col-4">Action</div>
                        </div>

                        <!-- Chapter List with Quiz Count & Actions -->
                        <div v-for="chapter in subject.chapters" :key="chapter.id" class="row align-items-center mb-2">
                            <router-link :to="'/quiz/' + chapter.id" class="col-5">{{ chapter.title }}</router-link>

                            <div class="col-3">{{ chapter.quiz_count }}</div>
                            <div class="col-4">
                                <button @click="editChapter(chapter.id)" class="btn btn-outline-warning btn-sm me-1">✏️</button>
                                <button @click="deleteChapter(chapter.id)" class="btn btn-outline-danger btn-sm">❌</button>
                            </div>
                        </div>

                        <div class="mt-3 text-center">
                            <router-link :to="'/add_chapter/' + subject.id" class="btn btn-success btn-sm w-100">
                                ➕ Add Chapter
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>



            

            <!-- Add New Subject Card -->
                <div class="row justify-content-center">
            <div class="col-md-4 mb-3 text-center">
                <div class="card border-primary shadow-sm">
                    <div class="card-body text-center">
                        <h4 class="text-primary">➕ Add New Subject</h4>
                        <router-link to="/add_subject" class="btn btn-outline-primary w-100">
                            Add Subject
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        </div>
    </div>`,

    data: function() {
        return {
            subjects: [],
            username: localStorage.getItem('username')
        }
    },

    methods: {
        fetchSubjects() {
            fetch('/api/subjects', {
                headers: {
                    "Authentication-Token": localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.subjects = data;
            })
            .catch(error => {
                console.error("Error fetching subjects:", error);
            });
        },

        editSubject(id) {
            this.$router.push(`/edit_subject/${id}`);
        },

        deleteSubject(id) {
            if (confirm("Are you sure you want to delete this subject?")) {
                fetch(`/api/subject/${id}`, {
                    method: 'DELETE',
                    headers: {
                        "Authentication-Token": localStorage.getItem('auth_token')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        alert("Subject deleted successfully!");
                        this.fetchSubjects();
                    } else {
                        alert("Failed to delete subject.");
                    }
                })
                .catch(error => console.error("Error deleting subject:", error));
            }
        },

        editChapter(id) {
            this.$router.push(`/edit_chapter/${id}`);
        },

        deleteChapter(id) {
            if (confirm("Are you sure you want to delete this chapter?")) {
                fetch(`/api/chapter/${id}`, {
                    method: 'DELETE',
                    headers: {
                        "Authentication-Token": localStorage.getItem('auth_token')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        alert("Chapter deleted successfully!");
                        this.fetchSubjects();  
                    } else {
                        alert("Failed to delete chapter.");
                    }
                })
                .catch(error => console.error("Error deleting chapter:", error));
            }
        }
    },

    mounted() {
        this.fetchSubjects();
    }
}
