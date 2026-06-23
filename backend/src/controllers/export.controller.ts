import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { ExportJobRequest, ExportJobResponse } from '../types/export';
import {
  createJob,
  getJob,
  isJobFileReady,
  toExportJobResponse
} from '../services/exportJob.service';

import { localArtifactStorage } from '../services/artifactStore/localArtifactStorage.service';


export const postExport = async (
  req: Request,
  res: Response<ExportJobResponse>
) => {
  const jobId = randomUUID();

  if (!req.file) {
    return res.status(400).json({
      jobId,
      status: 'failed',
      error: {
        code: 'MISSING_FILE',
        message: 'Expected multipart file field named file.'
      }
    });
  }

  const metadata = JSON.parse(req.body.metadata ?? '{}');

  const inputKey = `${jobId}/input.3mf`;

  const storedInput = await localArtifactStorage.writeBuffer(
    inputKey,
    req.file.buffer
  );

  const request: ExportJobRequest = {
    input: {
      format: '3mf',
      artifactKey: storedInput.key,
      originalFilename: req.file.originalname
    },
    output: metadata.output,
    model: metadata.model,
    options: metadata.options
  };

  const job = createJob(jobId, request, storedInput.filePath);

  res.status(202).json(toExportJobResponse(job));
};

export const getExportStatus = (
  req: Request<{ jobId: string }>,
  res: Response<ExportJobResponse>
) => {
  const { jobId } = req.params;

  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({
      jobId,
      status: 'failed',
      error: {
        code: 'JOB_NOT_FOUND',
        message: 'Export job was not found.'
      }
    });
  }

  res.status(200).json(toExportJobResponse(job));
};

export const downloadExport = (
  req: Request<{ jobId: string }>,
  res: Response
) => {
  const { jobId } = req.params;

  const job = getJob(jobId);

  if (!job) {
    return res.status(404).json({
      error: 'Export job was not found.'
    });
  }

  if (!isJobFileReady(job)) {
    return res.status(409).json({
      error: 'Export is not ready for download.'
    });
  }


  res.download(job.outputFilePath, job.file.filename);
};