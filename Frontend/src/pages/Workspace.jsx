import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useSearchParams
} from "react-router-dom";

import {
    streamGeneration,
    getConversation
} from "../services/generationService";

export default function Workspace({
    projectId: projectIdProp
}) {
    const [
        searchParams
    ] = useSearchParams();

    /*
     * Prefer an explicitly supplied projectId,
     * otherwise read ?project=... from the URL.
     */
    const projectId =
        projectIdProp ||
        searchParams.get(
            "project"
        );

    const [prompt, setPrompt] =
        useState("");

    const [output, setOutput] =
        useState("");

    const [messages, setMessages] =
        useState([]);

    const [
        conversationId,
        setConversationId
    ] = useState(null);

    const [
        isGenerating,
        setIsGenerating
    ] = useState(false);

    const [error, setError] =
        useState("");

    const abortControllerRef =
        useRef(null);

    const resetWorkspaceState = () => {
        setConversationId(null);
        setMessages([]);
        setOutput("");
        setError("");
    };

    /*
     * When the project changes, clear the
     * conversation so stale chat state is not
     * reused for the new project.
     */
    useEffect(() => {
        queueMicrotask(() => {
            resetWorkspaceState();
        });
    }, [projectId]);

    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleGenerate =
        async () => {
            if (isGenerating) {
                return;
            }

            if (!projectId) {
                setError(
                    "Please select or create a project first."
                );

                return;
            }

            const cleanPrompt =
                prompt.trim();

            if (!cleanPrompt) {
                setError(
                    "Please enter a prompt."
                );

                return;
            }

            setIsGenerating(true);
            setError("");

            /*
             * Start with an empty output for the
             * NEW response.
             */
            setOutput("");

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

                        type: "chat",

                        prompt:
                            cleanPrompt
                    },
                    {
                        signal:
                            controller.signal,

                        onMeta: (
                            data
                        ) => {
                            if (
                                data.conversationId
                            ) {
                                setConversationId(
                                    data.conversationId
                                );
                            }
                        },

                        onDelta: (
                            delta
                        ) => {
                            streamedText +=
                                delta;

                            setOutput(
                                streamedText
                            );
                        },

                        onDone: async (
                            data
                        ) => {
                            /*
                             * NEVER replace a valid
                             * streamed response with
                             * undefined/empty data.
                             */
                            const finalText =
                                data.result?.trim()
                                    ? data.result
                                    : streamedText;

                            setOutput(
                                finalText
                            );

                            if (
                                data.conversationId
                            ) {
                                setConversationId(
                                    data.conversationId
                                );

                                /*
                                 * Load the persisted
                                 * conversation after the
                                 * server saves it.
                                 */
                                try {
                                    const response =
                                        await getConversation(
                                            data.conversationId
                                        );

                                    const conversation =
                                        response.data;

                                    setMessages(
                                        conversation.messages ||
                                            []
                                    );

                                    /*
                                     * Only update output
                                     * from saved conversation
                                     * if it actually contains
                                     * an assistant response.
                                     */
                                    const savedAssistantMessages =
                                        (
                                            conversation.messages ||
                                            []
                                        ).filter(
                                            (
                                                message
                                            ) =>
                                                message.role ===
                                                "assistant"
                                        );

                                    const lastSavedResponse =
                                        savedAssistantMessages[
                                            savedAssistantMessages.length -
                                                1
                                        ];

                                    if (
                                        lastSavedResponse
                                            ?.content
                                    ) {
                                        setOutput(
                                            lastSavedResponse.content
                                        );
                                    }
                                } catch (
                                    conversationError
                                ) {
                                    console.error(
                                        "Unable to reload conversation:",
                                        conversationError
                                    );
                                }
                            }

                            if (
                                data.usage
                            ) {
                                window.dispatchEvent(
                                    new CustomEvent(
                                        "nexa-usage-updated",
                                        {
                                            detail:
                                                data.usage
                                        }
                                    )
                                );
                            }

                            setPrompt("");
                        },

                        onError: (
                            data
                        ) => {
                            setError(
                                data.message ||
                                    "AI generation failed."
                            );
                        }
                    }
                );
            } catch (
                requestError
            ) {
                if (
                    requestError.name !==
                    "AbortError"
                ) {
                    setError(
                        requestError.response
                            ?.data?.message ||
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

    const handleNewConversation =
        () => {
            abortControllerRef.current?.abort();

            setConversationId(
                null
            );

            setMessages([]);

            setOutput("");

            setPrompt("");

            setError("");

            setIsGenerating(false);
        };

    const handleStop =
        () => {
            abortControllerRef.current?.abort();

            abortControllerRef.current =
                null;

            setIsGenerating(false);
        };

    const handleCopy =
        async () => {
            if (!output) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    output
                );
            } catch (
                copyError
            ) {
                console.error(
                    "Copy failed:",
                    copyError
                );
            }
        };

    return (
        <div className="workspace">
            <div className="workspace-header">
                <div>
                    <span className="eyebrow">
                        AI WORKSPACE
                    </span>

                    <h1>
                        Create something great.
                    </h1>

                    <p>
                        Chat with NexaAI using
                        persistent conversation memory.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={
                        handleNewConversation
                    }
                    disabled={
                        isGenerating
                    }
                >
                    New chat
                </button>
            </div>

            {error && (
                <div className="workspace-error">
                    {error}
                </div>
            )}

            {!projectId && (
                <div className="workspace-error">
                    No project selected. Please
                    create or select a project.
                </div>
            )}

            <div className="chat-container">
                {messages.length > 0 && (
                    <div className="message-list">
                        {messages.map(
                            (
                                message,
                                index
                            ) => (
                                <div
                                    key={
                                        message._id ||
                                        index
                                    }
                                    className={`message ${
                                        message.role ===
                                        "assistant"
                                            ? "message-ai"
                                            : "message-user"
                                    }`}
                                >
                                    <div className="message-role">
                                        {message.role ===
                                        "assistant"
                                            ? "NexaAI"
                                            : "You"}
                                    </div>

                                    <div className="message-content">
                                        {
                                            message.content
                                        }
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}

                {output && (
                    <section className="output-card">
                        <div className="output-header">
                            <div>
                                <span>
                                    NEXAAI
                                </span>

                                <h2>
                                    Output
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCopy
                                }
                                disabled={
                                    isGenerating
                                }
                            >
                                Copy
                            </button>
                        </div>

                        <div className="output-content">
                            {output}

                            {isGenerating && (
                                <span className="streaming-cursor">
                                    ▌
                                </span>
                            )}
                        </div>
                    </section>
                )}

                <div className="prompt-card">
                    <textarea
                        value={prompt}
                        onChange={(
                            event
                        ) =>
                            setPrompt(
                                event
                                    .target
                                    .value
                            )
                        }
                        placeholder={
                            projectId
                                ? "Ask NexaAI anything..."
                                : "Select a project first..."
                        }
                        disabled={
                            isGenerating ||
                            !projectId
                        }
                        rows={5}
                    />

                    <div className="prompt-actions">
                        {isGenerating ? (
                            <button
                                type="button"
                                onClick={
                                    handleStop
                                }
                            >
                                Stop
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={
                                    handleGenerate
                                }
                                disabled={
                                    !projectId ||
                                    !prompt.trim()
                                }
                            >
                                Generate with AI
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}