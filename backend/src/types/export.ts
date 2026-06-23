export type ExportJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed';

export type ExportTargetProfile =
  | 'creality'
  | 'bambu';

export type ExportInputFormat =
  | '3mf';

export type ExportOutputFormat =
  | '3mf';

export type ExportFile = {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
};

export type ExportJobRequest = {
  input: {
    format: ExportInputFormat;

    // key/path where the uploaded/generated frontend 3MF was stored
    artifactKey: string;

    originalFilename?: string;
  };

  output: {
    format: ExportOutputFormat;
    targetProfile: ExportTargetProfile;
  };

  model?: {
    name?: string;
  };

  options?: {
    preserveOriginal?: boolean;
    includeMetadata?: boolean;
  };
};

export type ExportJobResponse = {
  jobId: string;
  status: ExportJobStatus;
  progress?: number;

  file?: ExportFile;

  warnings?: string[];

  error?: {
    code: string;
    message: string;
  };
};

export type ExportJobRecord = ExportJobResponse & {
  request: ExportJobRequest;

  inputFilePath?: string;
  outputFilePath?: string;

  createdAt: Date;
  updatedAt: Date;
};