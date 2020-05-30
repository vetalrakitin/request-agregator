function create(agent, baseUrl = '') {
    return {
        get: (url) => {
            return agent
                .get(baseUrl + url)
                .then((response) => response.data);
        },
    };
}

module.exports = {
    create,
};
