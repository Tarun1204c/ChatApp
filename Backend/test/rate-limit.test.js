import assert from "node:assert/strict";
import { test } from "node:test";

process.env.API_RATE_LIMIT_MAX = "5";
process.env.CHAT_RATE_LIMIT_MAX = "1";

const { default: app } = await import("../src/app.js");

const createServer = () => new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
        const { port } = server.address();
        resolve(server);
    });
});

test("sets an image and socket CSP", async () => {
    const server = await createServer();
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    try {
        const response = await fetch(`${baseUrl}/`);
        const contentSecurityPolicy = response.headers.get("content-security-policy") || "";

        assert.match(contentSecurityPolicy, /img-src\s+'self'\s+data:/);
        assert.match(contentSecurityPolicy, /connect-src\s+'self'\s+ws:\s+wss:/);
    } finally {
        server.close();
    }
});

test("limits requests by client IP", async () => {
    const server = await createServer();
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const ipA = "203.0.113.10";
    const ipB = "203.0.113.11";

    try {
        for (let requestNumber = 1; requestNumber <= 5; requestNumber += 1) {
            const response = await fetch(`${baseUrl}/api/auth/get-me`, {
                headers: { "x-forwarded-for": ipA }
            });

            assert.notEqual(response.status, 429);
        }

        const throttledResponse = await fetch(`${baseUrl}/api/auth/get-me`, {
            headers: { "x-forwarded-for": ipA }
        });

        assert.equal(throttledResponse.status, 429);
        assert.ok(throttledResponse.headers.get("retry-after"));
        assert.equal(
            throttledResponse.headers.get("content-type")?.includes("application/json"),
            true
        );

        const differentIpResponse = await fetch(`${baseUrl}/api/auth/get-me`, {
            headers: { "x-forwarded-for": ipB }
        });

        assert.notEqual(differentIpResponse.status, 429);
    } finally {
        server.close();
    }
});

test("applies a tighter limit to the chat send route", async () => {
    const server = await createServer();
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const ip = "203.0.113.12";

    try {
        const firstResponse = await fetch(`${baseUrl}/api/chats/message`, {
            method: "GET",
            headers: { "x-forwarded-for": ip }
        });

        assert.notEqual(firstResponse.status, 429);

        const throttledResponse = await fetch(`${baseUrl}/api/chats/message`, {
            method: "GET",
            headers: { "x-forwarded-for": ip }
        });

        assert.equal(throttledResponse.status, 429);
        assert.ok(throttledResponse.headers.get("retry-after"));
        assert.equal(
            throttledResponse.headers.get("content-type")?.includes("application/json"),
            true
        );
    } finally {
        server.close();
    }
});
