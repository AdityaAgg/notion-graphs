export function apiDomain() {
    if (process.env.NODE_ENV === 'production') {
        return "https://l175wxlpxi.execute-api.us-east-1.amazonaws.com";
    } else {
        return "localhost";
    }
}

export function urlPath() {
    if (process.env.NODE_ENV === 'production') {
        return `https://${apiDomain()}/production`;
    } else {
        return `http://${apiDomain()}:5000`;
    }
}

