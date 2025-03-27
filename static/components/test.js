
@app.route('/api/admin_search', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_search():
    search_type = request.args.get("searchType")
    query = request.args.get("query", "").strip()

    if not query:
        return jsonify({"error": "Search query required"}), 400

    if search_type == "user":
        results = User.query.filter(User.username.ilike(f"%{query}%")).all()
        response = [{"id": u.id, "username": u.username, "email": u.email, "role": u.roles[0].name if u.roles else "N/A"} for u in results]

    elif search_type == "subject":
        results = Subject.query.filter(Subject.name.ilike(f"%{query}%")).all()
        response = [{"id": s.id, "name": s.name, "description": s.description} for s in results]

    elif search_type == "chapter":
        results = Chapter.query.filter(Chapter.title.ilike(f"%{query}%")).all()
        response = [{"id": c.id, "title": c.title, "subject_id": c.subject_id} for c in results]

    else:
        return jsonify({"error": "Invalid search type"}), 400

    return jsonify({"results": response}), 200






export default {
    template: `
    <div class="container mt-4">
        <h2 class="text-center text-primary">🔍 Admin Search</h2>

        <!-- Search Form -->
        <div class="input-group mb-3">
            <select v-model="searchType" class="form-select">
                <option value="user">Search User</option>
                <option value="subject">Search Subject</option>
                <option value="chapter">Search Chapter</option>
            </select>
            <input type="text" v-model="searchQuery" class="form-control" placeholder="Enter search term...">
            <button @click="performSearch" class="btn btn-primary">🔍 Search</button>
        </div>

        <!-- Results Table -->
        <div v-if="results.length" class="table-responsive">
            <table class="table table-striped text-center">
                <thead class="table-dark">
                    <tr>
                        <th v-for="(header, index) in tableHeaders" :key="index">{{ header }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="result in results" :key="result.id">
                        <td v-for="(value, key) in result" :key="key">{{ value }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        
    </div>
    `,

    data() {
        return {
            searchType: "user", // Default search type
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
        }
    }
};
