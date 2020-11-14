export function apiDomain() {
    if (process.env.NODE_ENV === 'production') {
        return "api.notion-graphs.com";
    } else {
        return "localhost";
    }
}

export function urlPath() {
    if (process.env.NODE_ENV === 'production') {
        return `https://${apiDomain()}/v1/production`;
    } else {
        return `http://${apiDomain()}:5000`;
    }
}

