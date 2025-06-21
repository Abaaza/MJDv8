import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

class S3Service {
  constructor() {
    // Check if we're in development mode first
    this.isLocalMode = process.env.NODE_ENV === 'development' || !process.env.S3_BUCKET_NAME;
    
    if (!this.isLocalMode) {
      // Only initialize S3 if we're not in local mode
      this.s3 = new AWS.S3({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
      this.bucketName = process.env.S3_BUCKET_NAME;
      
      if (!this.bucketName) {
        console.error('S3_BUCKET_NAME environment variable is required for production');
        throw new Error('S3_BUCKET_NAME environment variable is required for production');
      }
    } else {
      console.warn('Running in local mode - files will be stored locally in temp/s3-local');
      this.ensureLocalStorageDir();
    }
  }
  
  ensureLocalStorageDir() {
    const localStorageDir = path.join(process.cwd(), 'temp', 's3-local');
    if (!fs.existsSync(localStorageDir)) {
      fs.mkdirSync(localStorageDir, { recursive: true });
    }
  }

  /**
   * Upload a file to S3
   * @param {Buffer} fileBuffer - The file buffer
   * @param {string} fileName - Original file name
   * @param {string} jobId - Job ID for organization
   * @param {string} fileType - 'input' or 'output'
   * @returns {Promise<{key: string, url: string}>}
   */
  async uploadFile(fileBuffer, fileName, jobId, fileType = 'input') {
    const key = `jobs/${jobId}/${fileType}/${uuidv4()}-${fileName}`;
    
    if (this.isLocalMode) {
      // Local file storage for development
      const localPath = path.join(process.cwd(), 'temp', 's3-local', key.replace(/\//g, '_'));
      const localDir = path.dirname(localPath);
      
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      
      fs.writeFileSync(localPath, fileBuffer);
      
      return {
        key: key,
        url: `local://${localPath}`,
        localPath: localPath
      };
    }
    
    if (!this.bucketName) {
      throw new Error('S3 bucket name is not configured. Please set S3_BUCKET_NAME environment variable.');
    }
    
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: this.getContentType(fileName),
      Metadata: {
        jobId: jobId,
        fileType: fileType,
        originalName: fileName
      }
    };

    await this.s3.upload(params).promise();
    
    return {
      key: key,
      url: `https://${this.bucketName}.s3.amazonaws.com/${key}`
    };
  }

  /**
   * Download a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<{Body: Buffer, ContentType: string, Metadata: object}>}
   */
  async downloadFile(key) {
    if (this.isLocalMode) {
      // Local file storage for development
      const localPath = path.join(process.cwd(), 'temp', 's3-local', key.replace(/\//g, '_'));
      
      if (!fs.existsSync(localPath)) {
        throw new Error(`File not found: ${key}`);
      }
      
      const fileBuffer = fs.readFileSync(localPath);
      const fileName = key.split('/').pop() || 'unknown';
      
      return {
        Body: fileBuffer,
        ContentType: this.getContentType(fileName),
        Metadata: {}
      };
    }
    
    if (!this.bucketName) {
      throw new Error('S3 bucket name is not configured. Please set S3_BUCKET_NAME environment variable.');
    }
    
    const params = {
      Bucket: this.bucketName,
      Key: key
    };

    const result = await this.s3.getObject(params).promise();
    return {
      Body: result.Body,
      ContentType: result.ContentType,
      Metadata: result.Metadata
    };
  }

  /**
   * Get a presigned URL for direct download
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
   * @returns {Promise<string>}
   */
  async getPresignedUrl(key, expiresIn = 3600) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: expiresIn
    };

    return await this.s3.getSignedUrlPromise('getObject', params);
  }

  /**
   * Delete a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<void>}
   */
  async deleteFile(key) {
    const params = {
      Bucket: this.bucketName,
      Key: key
    };

    await this.s3.deleteObject(params).promise();
  }

  /**
   * List files for a job
   * @param {string} jobId - Job ID
   * @param {string} fileType - 'input' or 'output' (optional)
   * @returns {Promise<Array>}
   */
  async listJobFiles(jobId, fileType = null) {
    const prefix = fileType 
      ? `jobs/${jobId}/${fileType}/`
      : `jobs/${jobId}/`;

    const params = {
      Bucket: this.bucketName,
      Prefix: prefix
    };

    const result = await this.s3.listObjectsV2(params).promise();
    return result.Contents || [];
  }

  /**
   * Copy a file within S3
   * @param {string} sourceKey - Source S3 object key
   * @param {string} destinationKey - Destination S3 object key
   * @returns {Promise<void>}
   */
  async copyFile(sourceKey, destinationKey) {
    const params = {
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${sourceKey}`,
      Key: destinationKey
    };

    await this.s3.copyObject(params).promise();
  }

  /**
   * Get content type based on file extension
   * @param {string} fileName
   * @returns {string}
   */
  getContentType(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes = {
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'csv': 'text/csv',
      'pdf': 'application/pdf',
      'json': 'application/json',
      'txt': 'text/plain'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Check if bucket exists and is accessible
   * @returns {Promise<boolean>}
   */
  async checkBucketAccess() {
    if (this.isLocalMode) {
      console.log('Running in local mode - S3 bucket check skipped');
      return true;
    }
    
    try {
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
      return true;
    } catch (error) {
      console.error('S3 bucket access error:', error);
      return false;
    }
  }
}

export default new S3Service(); 