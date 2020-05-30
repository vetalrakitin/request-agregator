const tap = require("tap");
const sinon = require("sinon");

const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const expect = chai.expect;

const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

const express = require("express");

const App = require("../lib/app");
const httpService = require("../services/http");

const testedController = require("./multiple");

let app;

const TIMEOUT = 2000;

const fakeSource = {
    get: (id) => {},
};

const createQuery = (data) => {
    let result = {};
    for (const key in data) {
        result[key] = data[key].request;
    }
    return result;
};

tap.test("should create an app", (t) => {
    const router = express.Router(); 
    router.get("/multiple", testedController.get(fakeSource, { timeout: TIMEOUT }))
    app = App.create(router);
    t.end();
});

// This test represents the source at the tested controller as a local instance like a DB
tap.test("should be OK 200 when the source is a local one", (t) => {
    // test data
    const data = {
        alice: {
            request: "/customer/44",
            resolve: { age: 54, id: 65 },
            expected: { data: { age: 54, id: 65 } },
        },
        car: {
            request: "/product/78",
            timeout: 3000,
            expected: { error: "timeout" },
        },
        ketchup: {
            request: "/product/43",
            reject: new Error("Some message"),
            expected: { error: "Some message" },
        },
        mark: {
            request: "/customer/49",
            reject: { error: "Some message" },
            expected: { error: { error: "Some message" } },
        },
    };

    // Stub
    fakeSource.get = sinon.stub();
    for (const key in data) {
        const item = data[key];
        if (item.resolve) {
            fakeSource.get.withArgs(item.request).resolves(item.resolve);
        } else if (item.reject) {
            fakeSource.get.withArgs(item.request).rejects(item.reject);
        } else if (item.timeout) {
            fakeSource.get
                .withArgs(item.request)
                .resolves(new Promise((res) => setTimeout(res, item.timeout)));
        }
    }

    return chai
        .request(app)
        .get(`/multiple`)
        .query(createQuery(data))
        .then(function (res) {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            t.ok(res.body);
            t.ok(typeof res.body == "object", "wrong type of the body");
            t.equal(
                Object.keys(res.body).length,
                Object.keys(data).length,
                "wrong amount of items at the response"
            );

            for (const key in data) {
                t.deepEqual(res.body[key], data[key].expected, `Unexpected result at key: ${key}`);
            }
        });
});

tap.test("should be OK 200 with empty query", (t) => {
    return chai
        .request(app)
        .get(`/multiple`)
        .then(function (res) {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            t.ok(res.body);
            t.ok(typeof res.body == "object", "wrong type of the body");
            t.equal(
                Object.keys(res.body).length,
                0,
                "should be an empty object"
            );
        });
});

// This case expects that controller use axios as the data source
tap.test("should be OK 200 when the source is axios", (t) => {
    fakeSource.get = httpService.create(axios).get;

    const mock = new MockAdapter(axios);
    const data = {
        soap: {
            request: "/product/45",
            status: 200,
            data: { id: 31, age: 45 },
            expected: { data: { id: 31, age: 45 } },
        },
        bread: {
            request: "/product/67",
            status: 500,
            expected: { error: { status: 500 } },
        },
        shirt: {
            request: "/product/77",
            status: 404,
            data: "Not Found",
            expected: { error: { status: 404, response: "Not Found" } },
        },
        bob: {
            request: "/customer/45",
            networkError: true,
            expected: { error: "Network Error" },
        },
        alice: {
            request: "/customer/87",
            timeout: true,
            expected: { error: "timeout of 0ms exceeded" },
        },
    };

    for (const key in data) {
        const item = data[key];
        if (item.networkError) {
            mock.onGet(item.request).networkError();
        } else if (item.timeout) {
            mock.onGet(item.request).timeout();
        } else {
            const params = [item.status];
            if (item.data) {
                params.push(item.data);
            }
            mock.onGet(item.request).reply(...params);
        }
    }

    return chai
        .request(app)
        .get(`/multiple`)
        .query(createQuery(data))
        .then(function (res) {
            expect(res).to.be.json;
            expect(res).to.have.status(200);
            t.ok(res.body);
            t.ok(typeof res.body == "object", "wrong type of the body");
            t.equal(
                Object.keys(res.body).length,
                Object.keys(data).length,
                "wrong amount of items at the response"
            );

            for (const key in data) {
                t.deepEqual(res.body[key], data[key].expected);
            }
        });
});
