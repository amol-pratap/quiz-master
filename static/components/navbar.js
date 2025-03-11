export default {
    template: `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
            <div class="col-10">
                <router-link class="navbar-brand" to="/"> Quiz Master </router-link>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
            </div>    
                

              <div class="navbar-nav d-flex align-items-center gap-2">
                        <!--    <router-link class="nav-link" to="/">Home</router-link>
                            <router-link class="nav-link" to="/index">Quiz</router-link>
                            <router-link class="nav-link" to="/summary">Summary</router-link>
                            <a class="nav-link" href="/logout">Logout</a>    -->

                            <router-link class="btn btn-primary" to="/login">Login</router-link>
                            <router-link class="btn btn-secondary" to="/sign_up">Sign Up</router-link>
            </div>
                    
                </div>
            </div>
        </nav>
    `
};
