export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center text-primary"> Admin Search</h2>


        <div class="input-group mb-3">
            <select v-model="searchType" class="form-select">
                <option value="user">Search User</option>
                <option value="subject">Search Subject</option>
                <option value="chapter">Search Chapter</option>
                <option value="quiz">Search Quiz</option>
            </select>
            <input type="text" v-model="searchQuery" class="form-control" placeholder="Enter search term...">
            <button @click="performSearch" class="btn btn-primary">🔍 Search</button>
        </div>

  
        <div v-if="results.length" class="table-responsive">
            <table class="table table-striped text-center">
                <thead class="table-dark">
                    <tr>
                        <th v-for="(header, index) in tableHeaders" :key="index">{{ header }}</th>
                       
                            <button @click="deleteUser(result.id)" class="btn btn-danger"> Action</button>
                        
                    </tr>
                    
                </thead>
                <tbody>
                    <tr v-for="result in results" :key="result.id">
                        <td v-for="(value, key) in result" :key="key">{{ value }}</td>
                        <td v-if="searchType === 'user'">
                            <button @click="deleteUser(result.id)" class="btn btn-danger">🗑 Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="text-center text-muted mt-4">
            <p class="fs-5"> No results found.</p>
        </div>
    </div>
    `,

    data() {
        return {
            searchType: "user", 
            searchQuery: "",
            results: [],
            tableHeaders: []
        };
    },

    methods: {
        performSearch() {
            if (!this.searchQuery.trim()) {
                alert("Please enter a search term.");
                return;
            }

            fetch(`/api/admin_search?searchType=${this.searchType}&query=${this.searchQuery}`, {
                headers: { "Authentication-Token": localStorage.getItem('auth_token') }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Search Error:", data.error);
                    this.results = [];
                } else {
                    this.results = data.results || [];
                    this.updateHeaders();
                }
            })
            .catch(error => console.error("Error fetching search results:", error));
        },

        updateHeaders() {
            if (this.results.length > 0) {
                this.tableHeaders = Object.keys(this.results[0]).map(key => key.replace("_", " ").toUpperCase());
            } else {
                this.tableHeaders = [];
            }
        },
    

    deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        fetch(`/api/delete_user/${userId}`, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem('auth_token') 
            }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            this.performSearch();  // Refresh the user list after deletion
        })
        .catch(error => console.error("Error deleting user:", error));
        }
    } 
};
