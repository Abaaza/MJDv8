import { put, del, list } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

class VercelBlobService {
  constructor() {
    this.isLocalMode = !process.env.BLOB_READ_WRITE_TOKEN;
    
    if (this.isLocalMode && !process.env.VERCEL) {
      console.warn('BLOB_READ_WRITE_TOKEN not set, using local file storage for development');
      this.ensureLocalStorageDir();
    }
  }
  
  ensureLocalStorageDir() {
    // Use /tmp in serverless, local dir otherwise
    const baseDir = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? '/tmp' : process.cwd();
    const localStorageDir = path.join(baseDir, 'temp', 'blob-local');
    
    try {
      if (!fs.existsSync(localStorageDir)) {
        fs.mkdirSync(localStorageDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Could not create local storage directory:', error.message);
    }
  }

  getLocalStorageDir() {
    const baseDir = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? '/tmp' : process.cwd();
    return path.join(baseDir, 'temp', 'blob-local');
  }

  /**
   * Upload a file to Vercel Blob
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
      const localStorageDir = this.getLocalStorageDir();
      const localPath = path.join(localStorageDir, key.replace(/\//g, '_'));
      const localDir = path.dirname(localPath);
      
      try {
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
        console.error('Local file write error:', error);
        // In serverless without blob token, return a mock response
        return {
          key: key,
          url: `mock://vercel-blob/${key}`,
          mock: true
        };
      }
    }
    
    try {
      const blob = await put(key, fileBuffer, {
        access: 'public',
        contentType: this.getContentType(fileName),
        addRandomSuffix: false
      });
      
      return {
        key: key,
        url: blob.url
      };
    } catch (error) {
      console.error('Vercel Blob upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download a file from Vercel Blob
   * @param {string} key - Blob object key
   * @returns {Promise<{Body: Buffer, ContentType: string}>}
   */
  async downloadFile(key) {
    if (this.isLocalMode) {
      // Local file storage for development
      const localStorageDir = this.getLocalStorageDir();
      const localPath = path.join(localStorageDir, key.replace(/\//g, '_'));
      
      if (!fs.existsSync(localPath)) {
        throw new Error(`File not found: ${key}`);
      }
      
      const fileBuffer = fs.readFileSync(localPath);
      const fileName = key.split('/').pop() || 'unknown';
      
      return {
        Body: fileBuffer,
        ContentType: this.getContentType(fileName)
      };
    }
    
    try {
      // For Vercel Blob, we need to fetch the file using the URL
      // First, we need to get the blob info to get the URL
      const response = await fetch(`https://blob.vercel-storage.com/${key}`);
      
      if (!response.ok) {
        throw new Error(`Blob not found: ${key}`);
      }
      
      const buffer = await response.arrayBuffer();
      const fileName = key.split('/').pop() || 'unknown';
      
      return {
        Body: Buffer.from(buffer),
        ContentType: this.getContentType(fileName)
      };
    } catch (error) {
      console.error('Vercel Blob download error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete a file from Vercel Blob
   * @param {string} url - Blob URL to delete
   * @returns {Promise<void>}
   */
  async deleteFile(url) {
    if (this.isLocalMode) {
      // For local mode, url is actually a local path
      const localPath = url.replace('local://', '');
      try {
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      } catch (error) {
        console.warn('Could not delete local file:', error.message);
      }
      return;
    }
    
    try {
      await del(url);
    } catch (error) {
      console.error('Vercel Blob delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
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
      // For local mode, scan the directory
      const localStorageDir = this.getLocalStorageDir();
      const files = [];
      
      try {
        if (fs.existsSync(localStorageDir)) {
          const allFiles = fs.readdirSync(localStorageDir);
          const prefixPattern = prefix.replace(/\//g, '_');
          
          allFiles.forEach(file => {
            if (file.startsWith(prefixPattern)) {
              files.push({
                key: file.replace(/_/g, '/'),
                url: `local://${path.join(localStorageDir, file)}`,
                size: fs.statSync(path.join(localStorageDir, file)).size
              });
            }
          });
        }
      } catch (error) {
        console.error('Error listing local files:', error);
      }
      
      return files;
    }

    try {
      const { blobs } = await list({ prefix });
      return blobs.map(blob => ({
        key: blob.pathname,
        url: blob.url,
        size: blob.size
      }));
    } catch (error) {
      console.error('Vercel Blob list error:', error);
      return [];
    }
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
}

export default new VercelBlobService(); 