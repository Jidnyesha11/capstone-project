import {
    Edit3,
    FolderKanban,
    MoreVertical,
    Plus,
    Trash2
} from "lucide-react";

import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    createProject,
    deleteProject,
    getProjects,
    updateProject
} from "../services/projectService";

import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

const Projects = () => {
    const navigate =
        useNavigate();

    const [projects, setProjects] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingProject, setEditingProject] =
        useState(null);

    const [form, setForm] =
        useState({
            name: "",
            description: "",
            color: "#111111"
        });

    const [error, setError] =
        useState("");

    const [toast, setToast] =
        useState("");

    const loadProjects =
        async () => {
            try {
                const result =
                    await getProjects();

                setProjects(
                    result.data || []
                );
            } catch (requestError) {
                setError(
                    requestError.response
                        ?.data?.message ||
                        "Unable to load projects."
                );
            } finally {
                setLoading(false);
            }
        };

    useEffect(() => {
        let isActive = true;

        const fetchProjects =
            async () => {
                try {
                    const result =
                        await getProjects();

                    if (!isActive) {
                        return;
                    }

                    setProjects(
                        result.data || []
                    );
                } catch (requestError) {
                    if (!isActive) {
                        return;
                    }

                    setError(
                        requestError.response
                            ?.data?.message ||
                            "Unable to load projects."
                    );
                } finally {
                    if (isActive) {
                        setLoading(false);
                    }
                }
            };

        fetchProjects();

        return () => {
            isActive = false;
        };
    }, []);

    const openCreate = () => {
        setEditingProject(null);

        setForm({
            name: "",
            description: "",
            color: "#111111"
        });

        setError("");

        setModalOpen(true);
    };

    const openEdit = (
        project
    ) => {
        setEditingProject(
            project
        );

        setForm({
            name:
                project.name || "",

            description:
                project.description ||
                "",

            color:
                project.color ||
                "#111111"
        });

        setError("");

        setModalOpen(true);
    };

    const handleSubmit =
        async (event) => {
            event.preventDefault();

            setError("");

            const name =
                form.name.trim();

            const description =
                form.description.trim();

            if (!name) {
                setError(
                    "Project name is required."
                );

                return;
            }

            try {
                if (editingProject) {
                    await updateProject(
                        editingProject._id,
                        {
                            ...form,
                            name,
                            description
                        }
                    );

                    setToast(
                        "Project updated successfully."
                    );

                    setModalOpen(false);

                    await loadProjects();

                    return;
                }

                /*
                 * Create the project and capture the
                 * actual project returned by the backend.
                 */
                const result =
                    await createProject({
                        ...form,
                        name,
                        description
                    });

                const newProject =
                    result.data;

                /*
                 * The backend must return the newly
                 * created MongoDB document.
                 */
                if (
                    !newProject ||
                    !newProject._id
                ) {
                    throw new Error(
                        "Project was created but the server did not return a project ID."
                    );
                }

                /*
                 * Add it immediately to local state.
                 */
                setProjects(
                    (current) => [
                        newProject,
                        ...current
                    ]
                );

                setToast(
                    "Project created successfully."
                );

                setForm({
                    name: "",
                    description: "",
                    color: "#111111"
                });

                setModalOpen(false);

                /*
                 * CRITICAL FIX:
                 *
                 * Navigate directly to the newly
                 * created project instead of reloading
                 * the projects list and losing the ID.
                 */
                navigate(
                    `/workspace?project=${encodeURIComponent(
                        newProject._id
                    )}`
                );
            } catch (requestError) {
                setError(
                    requestError.response
                        ?.data?.message ||
                        requestError.message ||
                        "Unable to save project."
                );
            }
        };

    const handleDelete =
        async (id) => {
            const confirmed =
                window.confirm(
                    "Delete this project?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await deleteProject(
                    id
                );

                setProjects(
                    (current) =>
                        current.filter(
                            (project) =>
                                project._id !==
                                id
                        )
                );

                setToast(
                    "Project deleted successfully."
                );
            } catch (requestError) {
                setError(
                    requestError.response
                        ?.data?.message ||
                        "Unable to delete project."
                );
            }
        };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="standard-page">
            <Toast
                message={toast}
                onClose={() =>
                    setToast("")
                }
            />

            <div className="page-header">
                <div>
                    <span className="eyebrow">
                        WORKSPACE
                    </span>

                    <h1>
                        Projects
                    </h1>

                    <p>
                        Organize your AI work into
                        focused spaces.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    type="button"
                    onClick={openCreate}
                >
                    <Plus size={17} />
                    New project
                </button>
            </div>

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            {projects.length ? (
                <div className="projects-grid">
                    {projects.map(
                        (project) => (
                            <div
                                className="project-card"
                                key={
                                    project._id
                                }
                            >
                                <div className="project-card-top">
                                    <div
                                        className="project-large-icon"
                                        style={{
                                            background:
                                                `${
                                                    project.color ||
                                                    "#111"
                                                }18`,

                                            color:
                                                project.color ||
                                                "#111"
                                        }}
                                    >
                                        <FolderKanban
                                            size={23}
                                        />
                                    </div>

                                    <button
                                        className="icon-button"
                                        type="button"
                                    >
                                        <MoreVertical
                                            size={18}
                                        />
                                    </button>
                                </div>

                                <h3>
                                    {
                                        project.name
                                    }
                                </h3>

                                <p>
                                    {
                                        project.description ||
                                        "A focused AI workspace for your next idea."
                                    }
                                </p>

                                <div className="project-card-footer">
                                    <Link
                                        to={`/workspace?project=${encodeURIComponent(
                                            project._id
                                        )}`}
                                        className="project-open"
                                    >
                                        Open workspace
                                    </Link>

                                    <div className="project-actions">
                                        <button
                                            type="button"
                                            className="icon-button"
                                            onClick={() =>
                                                openEdit(
                                                    project
                                                )
                                            }
                                            title="Edit"
                                        >
                                            <Edit3
                                                size={
                                                    16
                                                }
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            className="icon-button danger"
                                            onClick={() =>
                                                handleDelete(
                                                    project._id
                                                )
                                            }
                                            title="Delete"
                                        >
                                            <Trash2
                                                size={
                                                    16
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            ) : (
                <EmptyState
                    title="Create your first project"
                    description="Projects keep your AI generations organized and easy to find."
                    action={
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={
                                openCreate
                            }
                        >
                            <Plus
                                size={17}
                            />
                            Create project
                        </button>
                    }
                />
            )}

            {modalOpen && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <div>
                                <span className="eyebrow">
                                    PROJECT
                                </span>

                                <h2>
                                    {editingProject
                                        ? "Edit project"
                                        : "New project"}
                                </h2>
                            </div>

                            <button
                                className="icon-button"
                                type="button"
                                onClick={() =>
                                    setModalOpen(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>
                        </div>

                        <form
                            className="modal-form"
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <label>
                                Project name

                                <input
                                    value={
                                        form.name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                name:
                                                    event
                                                        .target
                                                        .value
                                            })
                                        )
                                    }
                                    placeholder="Marketing campaign"
                                    required
                                />
                            </label>

                            <label>
                                Description

                                <textarea
                                    value={
                                        form.description
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setForm(
                                            (
                                                current
                                            ) => ({
                                                ...current,
                                                description:
                                                    event
                                                        .target
                                                        .value
                                            })
                                        )
                                    }
                                    placeholder="What is this project about?"
                                    rows={4}
                                />
                            </label>

                            <label>
                                Project color

                                <div className="color-input">
                                    <input
                                        type="color"
                                        value={
                                            form.color
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    color:
                                                        event
                                                            .target
                                                            .value
                                                })
                                            )
                                        }
                                    />

                                    <span>
                                        {
                                            form.color
                                        }
                                    </span>
                                </div>
                            </label>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() =>
                                        setModalOpen(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {editingProject
                                        ? "Save changes"
                                        : "Create project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;