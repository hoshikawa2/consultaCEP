//-----------------------------------
const {
    Tracer,
    BatchRecorder,
    jsonEncoder: {JSON_V2}
} = require('zipkin');

const {HttpLogger} = require('zipkin-transport-http');
const debug = 'undefined' !== typeof window
    ? window.location.search.indexOf('debug') !== -1
    : process.env.DEBUG;

const CLSContext = require('zipkin-context-cls');

const httpLogger = new HttpLogger({
    endpoint: 'https://aaaac6cswfqmgaaaaaaaaaae3q.apm-agt.us-ashburn-1.oci.oraclecloud.com/20200101/observations/public-span?dataFormat=zipkin&dataFormatVersion=2&dataKey=KYXSMQC7DELJ2NSHIKFM6B3RUJRFFJNR',
    jsonEncoder: JSON_V2
})

const tracer = new Tracer({
    ctxImpl: new CLSContext('zipkin'), // implicit in-process context
    recorder: new BatchRecorder({
        logger: httpLogger
    }), // batched http recorder
    localServiceName: 'consultaCEP', // name of this application
    supportsJoin: false //Span join disable setting
});

//-----------------------------------

function recorder(serviceName) {
    return debug ? debugRecorder(serviceName) : new BatchRecorder({logger: httpLogger});
}

function debugRecorder(serviceName) {
    // This is a hack that lets you see the data sent to Zipkin!
    const logger = {
        logSpan: (span) => {
            const json = JSON_V2.encode(span);
            console.log(`${serviceName} reporting: ${json}`);
            httpLogger.logSpan(span);
        }
    };

    const batchRecorder = new BatchRecorder({logger});

    // This is a hack that lets you see which annotations become which spans
    return ({
        record: (rec) => {
            const {spanId, traceId} = rec.traceId;
            console.log(`${serviceName} recording: ${traceId}/${spanId} ${rec.annotation.toString()}`);
            batchRecorder.record(rec);
        }
    });
}
module.exports.recorder = recorder;