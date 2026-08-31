import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    getGenerations,
    deleteGeneration,
    regenerateGeneration
} from "../services/generationService";

export default function History() {
    const [items, setItems] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadHistory =
        useCallback(async () => {
            try {
                setLoading(true);

                const response =
                    await getGenerations({
                        search
                    });

                setItems(
                    response.data || []
                );
            } catch (requestError) {
                setError(
                    requestError.message ||
                        "Unable to load history."
                );
            } finally {
                setLoading(false);
            }
        }, [search]);

    useEffect(() => {
        const timer =
            setTimeout(() => {
                loadHistory();
            }, 250);

        return () =>
            clearTimeout(timer);
    }, [loadHistory]);

    const copyText =
        async (text) => {
            await navigator.clipboard.writeText(
                text
            );
        };

    const exportText =
        (item) => {
            const content =
                `NexaAI Generation\n\n` +
                `Prompt:\n${item.prompt}\n\n` +
                `Output:\n${item.result}\n\n` +
                `Model: ${item.model}\n` +
                `Created: ${new Date(
                    item.createdAt
                ).toLocaleString()}`;

            const blob =
                new Blob(
                    [content],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "nexaai-generation.txt";

            link.click();

            URL.revokeObjectURL(
                url
            );
        };

    const exportJson =
        (item) => {
            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            item,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                "nexaai-generation.json";

            link.click();

            URL.revokeObjectURL(
                url
            );
        };

    const remove =
        async (id) => {
            try {
                await deleteGeneration(
                    id
                );

                setItems(
                    (current) =>
                        current.filter(
                            (item) =>
                                item._id !==
                                id
                        )
                );
            } catch (requestError) {
                setError(
                    requestError.message ||
                        "Unable to delete."
                );
            }
        };

    const regenerate =
        async (id) => {
            try {
                const response =
                    await regenerateGeneration(
                        id
                    );

                const generated =
                    response.data;

                setItems(
                    (current) => [
                        generated,
                        ...current
                    ]
                );
            } catch (requestError) {
                setError(
                    requestError.message ||
                        "Unable to regenerate."
                );
            }
        };

    const visibleItems =
        useMemo(
            () =>
                items.filter(
                    (item) =>
                        !search ||
                        item.prompt
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        item.result
                            ?.toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                ),
            [items, search]
        );

    return (
        <main className="history-page">
            <header className="page-header">
                <div>
                    <span className="eyebrow">
                        AI HISTORY
                    </span>

                    <h1>
                        Your generations
                    </h1>

                    <p>
                        Search, copy, regenerate,
                        export, or delete previous
                        AI outputs.
                    </p>
                </div>

                <input
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target
                                .value
                        )
                    }
                    placeholder="Search history..."
                />
            </header>

            {error && (
                <div className="workspace-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="empty-state">
                    Loading history...
                </div>
            ) : visibleItems.length ===
              0 ? (
                <div className="empty-state">
                    No generations found.
                </div>
            ) : (
                <div className="history-list">
                    {visibleItems.map(
                        (item) => (
                            <article
                                className="history-card"
                                key={item._id}
                            >
                                <div className="history-card-top">
                                    <div>
                                        <span>
                                            {item.type}
                                        </span>

                                        <h2>
                                            {
                                                item.prompt
                                            }
                                        </h2>
                                    </div>

                                    <time>
                                        {new Date(
                                            item.createdAt
                                        ).toLocaleString()}
                                    </time>
                                </div>

                                <div className="history-result">
                                    {
                                        item.result
                                    }
                                </div>

                                <div className="history-actions">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyText(
                                                item.result
                                            )
                                        }
                                    >
                                        Copy
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            regenerate(
                                                item._id
                                            )
                                        }
                                    >
                                        Regenerate
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            exportText(
                                                item
                                            )
                                        }
                                    >
                                        Export TXT
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            exportJson(
                                                item
                                            )
                                        }
                                    >
                                        Export JSON
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            remove(
                                                item._id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        )
                    )}
                </div>
            )}
        </main>
    );
}