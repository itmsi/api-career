const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const otelResources = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

// The OTLPTraceExporter natively reads OTEL_EXPORTER_OTLP_ENDPOINT from environment
const traceExporter = new OTLPTraceExporter();

const createResource = () => {
    const resourceAttributes = {
        [ATTR_SERVICE_NAME]: process.env.SERVICE_NAME || 'api-hrm',
    };

    if (typeof otelResources.Resource === 'function') {
        return new otelResources.Resource(resourceAttributes);
    }

    if (typeof otelResources.resourceFromAttributes === 'function') {
        return otelResources.resourceFromAttributes(resourceAttributes);
    }

    return undefined;
};

const sdk = new opentelemetry.NodeSDK({
    ...(createResource() ? { resource: createResource() } : {}),
    traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            // We explicitly disable fs traces to prevent spamming the tracer with too many spans
            '@opentelemetry/instrumentation-fs': { enabled: false },
        })
    ]
});

try {
    sdk.start();
    console.log('✅ OpenTelemetry Tracing initialized!');
} catch (error) {
    console.log('❌ Error initializing tracing', error);
}

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
