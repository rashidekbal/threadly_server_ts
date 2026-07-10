import fetchDb from "../utils/dbQueryHelper.js";

const logAnomaly = (errorMessage: string, errorCode: string | null, apiPath: string | null, severity: string = 'medium') => {
  return fetchDb(
    `insert into system_anomalies (error_message, error_code, api_path, severity) values (?, ?, ?, ?)`,
    [errorMessage, errorCode, apiPath, severity]
  );
};

const getAnomalies = (status: string) => {
  return fetchDb(
    `select * from system_anomalies where status=? order by createdAt desc`,
    [status]
  );
};

const resolveAnomaly = (anomalyId: number) => {
  return fetchDb(
    `update system_anomalies set status='resolved' where anomaly_id=?`,
    [anomalyId]
  );
};

export { logAnomaly, getAnomalies, resolveAnomaly };
