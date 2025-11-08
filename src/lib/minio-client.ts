import * as Minio from "minio";

const {
    MINIO_ENDPOINT,
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    MINIO_USE_SSL,
    MINIO_PORT,
} = process.env;

if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY || !MINIO_PORT) {
    throw new Error(
        "Missing one or more required MinIO environment variables: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_PORT",
    );
}

export const minioClient = new Minio.Client({
    accessKey: MINIO_ACCESS_KEY,
    endPoint: MINIO_ENDPOINT,
    port: Number(MINIO_PORT),
    secretKey: MINIO_SECRET_KEY,
    useSSL: MINIO_USE_SSL === "true",
});
