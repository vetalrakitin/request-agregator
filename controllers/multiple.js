const JSONStream = require("JSONStream");

// Expected that the source could be different, not only http request.
// So we should resolve actual error
function resolveErrorResponse(err) {
    if (err instanceof Error) {
        const originStatus = err && err.response && err.response.status;
        const originResponse = err && err.response && err.response.data;
        if (originResponse || originStatus) {
            return { status: originStatus, response: originResponse };
        } else {
            return err.message
        }
    } else {
        return err;
    }
}

function get(service, opts = {}) {
    return (req, res, next) => {
        const query = req.query;

        const stream = JSONStream.stringifyObject("{", ",", "}");

        res.set('Content-Type', 'application/json');
        stream.pipe(res);

        const callService = (key) => {
            let promises = [] 
            let timeout
            
            promises.push(service.get(query[key]));
            
            // Expected that the source has no timeout event and wont reject an error in the case
            if (opts.timeout) {
                promises.push(new Promise((res,rej) => timeout = setTimeout(() => {rej(new Error("timeout"))}, opts.timeout)))
            }

            return Promise.race(promises)
                .then((data) => {
                    if (timeout) {
                        clearTimeout(timeout)
                    }
                    stream.write([key, { data }]);
                })
                .catch((err) => {
                    if (timeout) {
                        clearTimeout(timeout)
                    }
                    stream.write([
                        key,
                        {
                            error: resolveErrorResponse(err),
                        },
                    ]);
                })
        }

        Promise.all(Object.keys(query).map(callService))
            .then(() => {
                stream.end();
            })
            .catch(next);
    };
}

module.exports = {
    get,
};
