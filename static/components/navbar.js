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
                <div class="collapse navbar-collapse col-6" id="navbarNav">

                <!--
                    <ul class="navbar-nav">
                        <li class="nav-item ">
                            <router-link class="nav-link" to="/">Home</router-link>
                        </li>
                        <li class=" nav-item">
                            <router-link class="nav-link" to="/index">Quiz</router-link>
                        </li>
                         <li class="col-2 nav-item">
                        <router-link class="nav-link" to="/summary"> Summary </router-link>
                        </li>
                        < <li class="col-2 nav-item">
                            <a class="nav-link" href="/logout">Logout</a>
                        </li>  
                     -->
                        <li class=" nav-item">
                        <router-link class="btn btn-primary" to="/login">Login</router-link>
                        </li>
                        <li class=" nav-item">
                        <router-link class="btn btn-secondary" to="/sign_up">Sign Up</router-link>
                         </li>
                    </ul>
                </div>
            </div>
        </nav>
    `
};
