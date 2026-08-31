import api from "./api";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const getToken = () =>
    localStorage.getItem(
        "nexa_token"
    );

export const getGenerations =
    async (params = {}) => {
        const response =
            await api.get(
                "/generations",
                {
                    params
                }
            );

        return response.data;
    };

export const deleteGeneration =
    async (id) => {
        const response =
            await api.delete(
                `/generations/${id}`
            );

        return response.data;
    };

export const regenerateGeneration =
    async (id) => {
        const response =
            await api.post(
                `/generations/${id}/regenerate`
            );

        return response.data;
    };

export const getUsage =
    async () => {
        const response =
            await api.get(
                "/generations/usage"
            );

        return response.data;
    };

export const getConversations =
    async (projectId) => {
        const response =
            await api.get(
                "/conversations",
                {
                    params: {
                        projectId
                    }
                }
            );

        return response.data;
    };

export const getConversation =
    async (id) => {
        const response =
            await api.get(
                `/conversations/${id}`
            );

        return response.data;
    };

export const createConversation =
    async (projectId) => {
        const response =
            await api.post(
                "/conversations",
                {
                    projectId
                }
            );

        return response.data;
    };

export const deleteConversation =
    async (id) => {
        const response =
            await api.delete(
                `/conversations/${id}`
            );

        return response.data;
    };

const parseBlock = (
    block,
    handlers
) => {
    let event = "message";
    let data = "";

    for (
        const line of block.split(
            /\r?\n/
        )
    ) {
        if (
            line.startsWith(
                "event:"
            )
        ) {
            event =
                line
                    .slice(6)
                    .trim();
        }

        if (
            line.startsWith(
                "data:"
            )
        ) {
            data +=
                line
                    .slice(5)
                    .trim();
        }
    }

    if (!data) {
        return;
    }

    let payload;

    try {
        payload =
            JSON.parse(data);
    } catch {
        return;
    }

    if (
        event === "meta" &&
        handlers.onMeta
    ) {
        handlers.onMeta(payload);
    }

    if (
        event === "delta" &&
        handlers.onDelta
    ) {
        handlers.onDelta(
            payload.delta || ""
        );
    }

    if (
        event === "done" &&
        handlers.onDone
    ) {
        handlers.onDone(payload);
    }

    if (
        event === "error" &&
        handlers.onError
    ) {
        handlers.onError(payload);
    }
};

export const streamGeneration =
    async (
        payload,
        handlers = {}
    ) => {
        const response =
            await fetch(
                `${API_URL}/generations/stream`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${getToken()}`
                    },

                    body:
                        JSON.stringify(
                            payload
                        ),

                    signal:
                        handlers.signal
                }
            );

        if (!response.ok) {
            let data;

            try {
                data =
                    await response.json();
            } catch {
                data = {};
            }

            const error =
                new Error(
                    data.message ||
                        "Generation failed."
                );

            error.status =
                response.status;

            error.data =
                data;

            throw error;
        }

        if (!response.body) {
            throw new Error(
                "Streaming is not supported."
            );
        }

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();

        let buffer = "";

        while (true) {
            const {
                value,
                done
            } =
                await reader.read();

            if (done) {
                break;
            }

            buffer +=
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );

            const blocks =
                buffer.split(
                    /\r?\n\r?\n/
                );

            buffer =
                blocks.pop() || "";

            for (
                const block of blocks
            ) {
                parseBlock(
                    block,
                    handlers
                );
            }
        }

        buffer +=
            decoder.decode();

        if (buffer.trim()) {
            parseBlock(
                buffer,
                handlers
            );
        }
    };