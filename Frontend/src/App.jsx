import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import {
    AuthProvider
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Workspace from "./pages/Workspace";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const ProtectedPage = ({
    children,
    adminOnly = false
}) => (
    <ProtectedRoute adminOnly={adminOnly}>
        <AppShell>
            {children}
        </AppShell>
    </ProtectedRoute>
);

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedPage>
                            <Dashboard />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/workspace"
                    element={
                        <ProtectedPage>
                            <Workspace />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/chat"
                    element={
                        <Navigate
                            to="/workspace"
                            replace
                        />
                    }
                />

                <Route
                    path="/projects"
                    element={
                        <ProtectedPage>
                            <Projects />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedPage>
                            <History />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedPage>
                            <Profile />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedPage>
                            <Settings />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedPage adminOnly>
                            <AdminDashboard />
                        </ProtectedPage>
                    }
                />

                <Route
                    path="/app"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={<NotFound />}
                />
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
