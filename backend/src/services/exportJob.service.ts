import { existsSync } from 'fs';
import {
  ExportJobRecord,
  ExportJobRequest,
  ExportJobResponse
} from '../types/export';

import { processThreeMfExport } from './threeMfExport.service';

export const jobs = new Map<string, ExportJobRecord>();
export const queue: string[] = [];

export const toExportJobResponse = (
  job: ExportJobRecord
): ExportJobResponse => ({
  jobId: job.jobId,
  status: job.status,
  progress: job.progress,
  file: job.file,
  warnings: job.warnings,
  error: job.error
});

export const createJob = (
  jobId: string,
  request: ExportJobRequest,
  inputFilePath?: string
): ExportJobRecord => {
  const now = new Date();

  const job: ExportJobRecord = {
    jobId,
    status: 'queued',
    progress: 0,
    request,
    inputFilePath,
    createdAt: now,
    updatedAt: now
  };

  jobs.set(jobId, job);
  queue.push(jobId);

  void processNextJob();

  return job;
};

export const getJob = (jobId: string) => {
  return jobs.get(jobId);
};

export const updateJob = (
  jobId: string,
  updates: Partial<ExportJobRecord>
) => {
  const job = jobs.get(jobId);

  if (!job) return;

  jobs.set(jobId, {
    ...job,
    ...updates,
    updatedAt: new Date()
  });
};

export type ExportJobRecordWithFile = ExportJobRecord & {
  outputFilePath: string;
  file: NonNullable<ExportJobRecord['file']>;
};

export const isJobFileReady = (
  job: ExportJobRecord
): job is ExportJobRecordWithFile => {
  return (
    job.status === 'completed' &&
    typeof job.outputFilePath === 'string' &&
    job.file !== undefined &&
    existsSync(job.outputFilePath)
  );
};

let isProcessing = false;

export const processNextJob = async () => {
  if (isProcessing) return;

  isProcessing = true;

  try {
    while (queue.length > 0) {
      const jobId = queue.shift();
      if (!jobId) continue;

      const job = getJob(jobId);
      if (!job) continue;

      try {
        updateJob(jobId, {
          status: 'processing',
          progress: 5
        });

        for await (const event of processThreeMfExport(job)) {
          if (event.type === 'progress') {
            updateJob(jobId, {
              status: 'processing',
              progress: event.progress
            });
          }

          if (event.type === 'completed') {
            updateJob(jobId, {
              status: 'completed',
              progress: 100,
              outputFilePath: event.artifact.filePath,
              file: {
                filename: event.artifact.filename,
                mimeType: event.artifact.mimeType,
                sizeBytes: event.artifact.sizeBytes,
                downloadUrl: `/api/v1/export/${jobId}/download`
              }
            });
          }
        }
      } catch (err) {
        updateJob(jobId, {
          status: 'failed',
          error: {
            code: 'EXPORT_FAILED',
            message: err instanceof Error ? err.message : 'Unknown export error.'
          }
        });
      }
    }
  } finally {
    isProcessing = false;
  }
};