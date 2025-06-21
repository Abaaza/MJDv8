import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

class S3Service {
  constructor() {
    // Check if we're in a serverless environment (Vercel, Lambda, etc.)
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTION_NAME;
    
    // Force S3 mode in serverless environments, even without credentials
    this.isLocalMode = !isServerless && process.env.NODE_ENV === 'development' && !process.env.S3_BUCKET_NAME;
    
    if (!this.isLocalMode) {
      // Initialize S3 (even if credentials are missing, for serverless compatibility)
      this.s3 = new AWS.S3({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
      this.bucketName = process.env.S3_BUCKET_NAME;
      
      if (!this.bucketName && !isServerless) {
        console.error('S3_BUCKET_NAME environment variable is required for production');
        throw new Error('S3_BUCKET_NAME environment variable is required for production');
      }
    } else {
      console.warn('Running in local mode - files will be stored locally in temp/s3-local');
      this.ensureLocalStorageDir();
    }
  }
  
  ensureLocalStorageDir() {
    // Only create directories in local development mode
    if (!this.isLocalMode) return;
    
    try {
      const localStorageDir = path.join(process.cwd(), 'temp', 's3-local');
      if (!fs.existsSync(localStorageDir)) {
        fs.mkdirSync(localStorageDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Could not create local storage directory:', error.message);
      // In serverless, we'll just skip local storage
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
      try {
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
      } catch (error) {
        console.error('Local file storage failed:', error);
        // Fall back to memory storage (temporary)
        return {
          key: key,
          url: `memory://${key}`,
          localPath: null
        };
      }
    }
    
    // In serverless without S3 configured, we'll simulate storage
    if (!this.bucketName) {
      console.warn('No S3 bucket configured in serverless environment - simulating storage');
      return {
        key: key,
        url: `simulated://${key}`,
        simulated: true
      };
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
      try {
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
      } catch (error) {
        console.error('Local file download failed:', error);
        throw new Error(`File not found: ${key}`);
      }
    }
    
    if (!this.bucketName) {
      throw new Error('File storage not available in serverless environment without S3 configuration');
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
    if (!this.bucketName) {
      throw new Error('Presigned URLs not available without S3 configuration');
    }
    
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
    if (this.isLocalMode) {
      try {
        const localPath = path.join(process.cwd(), 'temp', 's3-local', key.replace(/\//g, '_'));
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (error) {
        console.warn('Could not delete local file:', error.message);
      }
      return;
    }
    
    if (!this.bucketName) {
      console.warn('File deletion not available without S3 configuration');
      return;
    }
    
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

    if (this.isLocalMode) {
      try {
        const localDir = path.join(process.cwd(), 'temp', 's3-local');
        const files = [];
        
        const allFiles = fs.readdirSync(localDir);
        const prefixPattern = prefix.replace(/\//g, '_');
        
        allFiles.forEach(file => {
          if (file.startsWith(prefixPattern)) {
            files.push({
              key: file.replace(/_/g, '/'),
              url: `local://${path.join(localDir, file)}`,
              size: fs.statSync(path.join(localDir, file)).size
            });
          }
        });
        
        return files;
      } catch (error) {
        console.warn('Could not list local files:', error.message);
        return [];
      }
    }
    
    if (!this.bucketName) {
      return [];
    }

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
    if (!this.bucketName) {
      throw new Error('File copying not available without S3 configuration');
    }
    
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
    
    if (!this.bucketName) {
      console.log('No S3 bucket configured - skipping access check');
      return false;
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