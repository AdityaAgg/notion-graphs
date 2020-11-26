export function apiDomain() {
    if (process.env.NODE_ENV === 'production') {
        return "api.notion-graphs.com";
    } else {
        return "localhost";
    }
}

export function localDomain() {
    if (process.env.NODE_ENV === 'production') {
        return "https://notion-graphs.com"
    } else {
        return "http://localhost:3000"
    }
}

export function urlPath() {
    if (process.env.NODE_ENV === 'production') {
        return `https://${apiDomain()}/v1`;
    } else {
        return `http://${apiDomain()}:5000`;
    }
}

