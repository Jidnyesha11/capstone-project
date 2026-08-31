import {
    Copy,
    FileText,
    History,
    LoaderCircle,
    MessageSquare,
    Plus,
    RefreshCw,
    Sparkles,
    Square,
    WandSparkles
} from "lucide-react";

import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    Link,
    useNavigate,
    useSearchParams
} from "react-router-dom";

import {
    getConversation,
    getConversations,
    getUsage,
    streamGeneration
} from "../services/generationService";

import {
    getProjects
} from "../services/projectService";

import Loader from "../components/Loader";

const SUGGESTIONS = [
    "Write a product launch announcement",
    "Create a professional email",
    "Generate a social media campaign",
    "Summarize this idea into key points"
];

const Workspace = () => {
    const [
        searchParams
    ] = useSearchParams();

    const navigate =
        useNavigate();

    const projectId =
        searchParams.get("project");

    const [projects, setProjects] =
        useState([]);

    const [conversations, setConversations] =
        useState([]);

    const [conversationId, setConversationId] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [prompt, setPrompt] =
        useState("");

    const [type, setType] =
        useState("general");

    const [output, setOutput] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [loadingConversation, setLoadingConversation] =
        useState(false);

    const [isGenerating, setIsGenerating] =
        useState(false);

    const [error, setError] =
        useState("");

    const [usage, setUsage] =
        useState(null);

    const abortControllerRef =
        useRef(null);

    const selectedProject =
        projects.find(
            (project) =>
                String(project._id) ===
                String(projectId)
        );

    const loadProjects =
        useCallback(async () => {
            const result =
                await getProjects();

            const list =
                result.data || [];

            setProjects(list);

            return list;
        }, []);

    const loadConversations =
        useCallback(
            async (id) => {
                if (!id) {
                    setConversations([]);
                    return;
                }

                const result =
                    await getConversations(
                        id
                    );

                setConversations(
                    result.data || []
                );
            },
            []
        );

    const loadUsage =
        useCallback(async () => {
            try {
                const result =
                    await getUsage();

                setUsage(
                    result.data
                );
            } catch {
                setUsage(null);
            }
        }, []);

    useEffect(() => {
        let active = true;

        const initialize =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const list =
                        await loadProjects();

                    if (!active) {
                        return;
                    }

                    if (!list.length) {
                        return;
                    }

                    if (
                        !projectId ||
                        !list.some(
                            (project) =>
                                String(
                                    project._id
                                ) ===
                                String(
                                    projectId
                                )
                        )
                    ) {
                        navigate(
                            `/workspace?project=${encodeURIComponent(
                                list[0]._id
                            )}`,
                            {
                                replace: true
                            }
                        );

                        return;
                    }

                    await Promise.all([
                        loadConversations(
                            projectId
                        ),
                        loadUsage()
                    ]);
                } catch (requestError) {
                    if (active) {
                        setError(
                            requestError.response
                                ?.data?.message ||
                                requestError.message ||
                                "Unable to load workspace."
                        );
                    }
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            };

        initialize();

        return () => {
            active = false;
        };
    }, [
        projectId,
        loadProjects,
        loadConversations,
        loadUsage,
        navigate
    ]);

    const selectConversation =
        async (id) => {
            if (!id) {
                return;
            }

            try {
                setLoadingConversation(
                    true
                );
                setError("");

                const result =
                    await getConversation(
                        id
                    );

                const conversation =
                    result.data;

                setConversationId(
                    conversation._id
                );

                setMessages(
                    conversation.messages ||
                        []
                );

                const assistants =
                    (
                        conversation.messages ||
                        []
                    ).filter(
                        (message) =>
                            message.role ===
                            "assistant"
                    );

                setOutput(
                    assistants[
                        assistants.length - 1
                    ]?.content || ""
                );
            } catch (requestError) {
                setError(
                    requestError.response
                        ?.data?.message ||
                        requestError.message ||
                        "Unable to load conversation."
                );
            } finally {
                setLoadingConversation(
                    false
                );
            }
        };

    const createNewConversation =
        () => {
            abortControllerRef.current?.abort();

            setConversationId(null);
            setMessages([]);
            setOutput("");
            setPrompt("");
            setError("");
            setIsGenerating(false);
        };

    const handleGenerate =
        async () => {
            if (isGenerating) {
                return;
            }

            if (!projectId) {
                setError(
                    "Select a project before generating."
                );
                return;
            }

            const cleanPrompt =
                prompt.trim();

            if (!cleanPrompt) {
                setError(
                    "Enter a prompt first."
                );
                return;
            }

            setIsGenerating(true);
            setError("");

            const controller =
                new AbortController();

            abortControllerRef.current =
                controller;

            let streamedText = "";

            try {
                await streamGeneration(
                    {
                        projectId,
                        conversationId,
                        type,
                        prompt:
                            cleanPrompt
                    },
                    {
                        signal:
                            controller.signal,

                        onMeta: (data) => {
                            if (
                                data.conversationId
                            ) {
                                setConversationId(
                                    data.conversationId
                                );
                            }
                        },

                        onDelta: (delta) => {
                            streamedText +=
                                delta;

                            setOutput(
                                streamedText
                            );
                        },

                        onDone: async (data) => {
                            const finalText =
                                data.result ||
                                streamedText;

                            setOutput(
                                finalText
                            );

                            if (
                                data.conversationId
                            ) {
                                setConversationId(
                                    data.conversationId
                                );

                                try {
                                    const conversationResult =
                                        await getConversation(
                                            data.conversationId
                                        );

                                    const conversation =
                                        conversationResult.data;

                                    setMessages(
                                        conversation.messages ||
                                            []
                                    );
                                } catch {
                                    setMessages(
                                        (current) => [
                                            ...current,
                                            {
                                                role:
                                                    "assistant",
                                                content:
                                                    finalText
                                            }
                                        ]
                                    );
                                }

                                await loadConversations(
                                    projectId
                                );
                            }

                            if (
                                data.usage
                            ) {
                                setUsage(
                                    data.usage
                                );
                            } else {
                                await loadUsage();
                            }

                            setPrompt("");
                        },

                        onError: (data) => {
                            setError(
                                data.message ||
                                    "AI generation failed."
                            );
                        }
                    }
                );
            } catch (requestError) {
                if (
                    requestError.name !==
                    "AbortError"
                ) {
                    setError(
                        requestError.data
                            ?.message ||
                            requestError.message ||
                            "AI generation failed."
                    );
                }
            } finally {
                abortControllerRef.current =
                    null;

                setIsGenerating(
                    false
                );
            }
        };

    const handleStop =
        () => {
            abortControllerRef.current?.abort();

            abortControllerRef.current =
                null;

            setIsGenerating(false);
        };

    const copyOutput =
        async () => {
            if (!output) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    output
                );
            } catch {
                setError(
                    "Unable to copy output."
                );
            }
        };

    const regenerate =
        () => {
            if (!output || isGenerating) {
                return;
            }

            setPrompt(
                "Regenerate the previous response with a better version."
            );
        };

    if (loading) {
        return <Loader />;
    }

    if (!projects.length) {
        return (
            <div className="workspace-empty">
                <div className="empty-icon">
                    <FolderIcon />
                </div>

                <h2>
                    Create your first project
                </h2>

                <p>
                    Every AI conversation belongs to
                    a project.
                </p>

                <Link
                    to="/projects"
                    className="btn btn-primary"
                >
                    <Plus size={17} />
                    Create project
                </Link>
            </div>
        );
    }

    return (
        <div className="standard-page">
            <div className="page-header">
                <div>
                    <span className="eyebrow">
                        AI WORKSPACE
                    </span>

                    <h1>
                        {selectedProject?.name ||
                            "AI Workspace"}
                    </h1>

                    <p>
                        Generate, refine, and
                        continue conversations with
                        NexaAI.
                    </p>
                </div>

                <div className="workspace-header-actions">
                    <Link
                        to="/history"
                        className="btn btn-outline btn-small"
                    >
                        <History size={16} />
                        History
                    </Link>

                    <button
                        type="button"
                        className="btn btn-primary btn-small"
                        onClick={
                            createNewConversation
                        }
                        disabled={
                            isGenerating
                        }
                    >
                        <Plus size={16} />
                        New chat
                    </button>
                </div>
            </div>

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}

            <div className="workspace-layout">
                <section className="generator-card">
                    <div className="generator-top">
                        <div className="ai-badge">
                            <Sparkles
                                size={17}
                            />
                            NexaAI
                        </div>

                        <span>
                            {usage
                                ? `${usage.generationsUsed || 0} / ${
                                      usage.limits?.generations || 10
                                  } generations`
                                : "Gemini AI"}
                        </span>
                    </div>

                    <div className="generator-form">
                        <div className="field-row">
                            <label>
                                Project

                                <select
                                    value={
                                        projectId ||
                                        ""
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        navigate(
                                            `/workspace?project=${encodeURIComponent(
                                                event
                                                    .target
                                                    .value
                                            )}`
                                        );
                                    }}
                                >
                                    {projects.map(
                                        (
                                            project
                                        ) => (
                                            <option
                                                key={
                                                    project._id
                                                }
                                                value={
                                                    project._id
                                                }
                                            >
                                                {
                                                    project.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <label>
                                Content type

                                <select
                                    value={
                                        type
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setType(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    <option value="general">
                                        General
                                    </option>

                                    <option value="blog">
                                        Blog
                                    </option>

                                    <option value="marketing">
                                        Marketing
                                    </option>

                                    <option value="social">
                                        Social
                                    </option>

                                    <option value="email">
                                        Email
                                    </option>

                                    <option value="summary">
                                        Summary
                                    </option>

                                    <option value="chat">
                                        Chat
                                    </option>
                                </select>
                            </label>
                        </div>

                        <label className="prompt-label">
                            Your prompt

                            <textarea
                                value={
                                    prompt
                                }
                                onChange={(
                                    event
                                ) =>
                                    setPrompt(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                maxLength={5000}
                                placeholder="Tell NexaAI what you want to create..."
                                disabled={
                                    isGenerating
                                }
                            />

                            <span className="character-count">
                                {prompt.length}
                                /5000
                            </span>
                        </label>

                        <div className="prompt-suggestions">
                            {SUGGESTIONS.map(
                                (
                                    suggestion
                                ) => (
                                    <button
                                        key={
                                            suggestion
                                        }
                                        type="button"
                                        onClick={() =>
                                            setPrompt(
                                                suggestion
                                            )
                                        }
                                        disabled={
                                            isGenerating
                                        }
                                    >
                                        {
                                            suggestion
                                        }
                                    </button>
                                )
                            )}
                        </div>

                        {isGenerating ? (
                            <button
                                type="button"
                                className="btn btn-dark generate-button"
                                onClick={
                                    handleStop
                                }
                            >
                                <Square
                                    size={16}
                                />
                                Stop generation
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary generate-button"
                                onClick={
                                    handleGenerate
                                }
                                disabled={
                                    !projectId ||
                                    !prompt.trim()
                                }
                            >
                                <WandSparkles
                                    size={17}
                                />
                                Generate with AI
                            </button>
                        )}

                        {usage && (
                            <div className="workspace-usage">
                                <span>
                                    {usage.tokensUsed || 0} tokens used
                                </span>

                                <span>
                                    {usage.tokensRemaining ||
                                        0} remaining
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                <section className="result-card">
                    <div className="result-header">
                        <div>
                            <h2>
                                AI output
                            </h2>

                            <div className="result-meta">
                                <span>
                                    <Sparkles
                                        size={11}
                                    />
                                    Gemini
                                </span>

                                {isGenerating && (
                                    <span>
                                        <LoaderCircle
                                            size={11}
                                            className="spin"
                                        />
                                        Streaming
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="result-actions">
                            <button
                                type="button"
                                className="icon-button"
                                onClick={
                                    copyOutput
                                }
                                disabled={
                                    !output
                                }
                                title="Copy"
                            >
                                <Copy
                                    size={16}
                                />
                            </button>

                            <button
                                type="button"
                                className="icon-button"
                                onClick={
                                    regenerate
                                }
                                disabled={
                                    !output ||
                                    isGenerating
                                }
                                title="Regenerate"
                            >
                                <RefreshCw
                                    size={16}
                                />
                            </button>
                        </div>
                    </div>

                    {output ? (
                        <div className="result-content">
                            <pre>
                                {output}
                            </pre>

                            {isGenerating && (
                                <span className="streaming-cursor">
                                    ▌
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="result-placeholder">
                            <div className="result-placeholder-icon">
                                <MessageSquare
                                    size={22}
                                />
                            </div>

                            <h3>
                                Your output appears here
                            </h3>

                            <p>
                                Enter a prompt on the left
                                and NexaAI will stream the
                                response here.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <section className="workspace-features">
                <div className="workspace-feature">
                    <MessageSquare
                        size={19}
                    />

                    <div>
                        <strong>
                            Multi-turn memory
                        </strong>

                        <span>
                            Continue the same conversation
                            without losing context.
                        </span>
                    </div>
                </div>

                <div className="workspace-feature">
                    <History
                        size={19}
                    />

                    <div>
                        <strong>
                            Persistent history
                        </strong>

                        <span>
                            Every completed generation is
                            saved to your account.
                        </span>
                    </div>
                </div>

                <div className="workspace-feature">
                    <FileText
                        size={19}
                    />

                    <div>
                        <strong>
                            Project context
                        </strong>

                        <span>
                            Your AI work stays separated by
                            project.
                        </span>
                    </div>
                </div>
            </section>

            <section className="workspace-conversations">
                <div className="card-header">
                    <div>
                        <span className="card-eyebrow">
                            CONVERSATIONS
                        </span>

                        <h2>
                            Recent chats
                        </h2>
                    </div>

                    <span className="admin-count">
                        {conversations.length}
                    </span>
                </div>

                {loadingConversation ? (
                    <div className="loader-wrapper">
                        <div className="loader loader-small" />
                    </div>
                ) : conversations.length ? (
                    <div className="conversation-list">
                        {conversations.map(
                            (
                                conversation
                            ) => (
                                <button
                                    key={
                                        conversation._id
                                    }
                                    type="button"
                                    className={`conversation-item ${
                                        String(
                                            conversationId
                                        ) ===
                                        String(
                                            conversation._id
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        selectConversation(
                                            conversation._id
                                        )
                                    }
                                >
                                    <MessageSquare
                                        size={16}
                                    />

                                    <span>
                                        {
                                            conversation.title
                                        }
                                    </span>

                                    <small>
                                        {new Date(
                                            conversation.lastMessageAt ||
                                                conversation.createdAt
                                        ).toLocaleDateString()}
                                    </small>
                                </button>
                            )
                        )}
                    </div>
                ) : (
                    <p className="workspace-muted">
                        No conversations yet. Your first
                        generation will create one.
                    </p>
                )}
            </section>
        </div>
    );
};

const FolderIcon = () => (
    <FileText size={23} />
);

export default Workspace;
