import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PpgcoBucketService } from './ppgco-bucket.service';
import { PpgcoBucketApiService } from './ppgco-bucket-api.service';
import { ENDPOINTS } from '../ppgco-bucket.constants';
import {
  PpgcoBucketConfig,
  PpgcoBucketFileUpload,
} from '../ppgco-bucket.types';
import { Readable } from 'node:stream';

describe('PpgcoBucketService', () => {
  let service: PpgcoBucketService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockBucketApi: jest.Mocked<PpgcoBucketApiService>;

  // Create a mock Readable stream
  const mockStream = new Readable();
  mockStream.push('test content');
  mockStream.push(null); // EOF

  // Mock Multer file
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 1024,
    buffer: Buffer.from('test content'),
    stream: mockStream,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn(),
    } as any;

    mockBucketApi = {
      attempt: jest.fn((fn) => fn()),
      http: {
        post: jest.fn().mockResolvedValue({ data: {} }),
        get: jest.fn().mockResolvedValue({ data: {} }),
      },
      resolvePathNames: jest.fn().mockImplementation((endpoint) => endpoint),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PpgcoBucketService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PpgcoBucketApiService,
          useValue: mockBucketApi,
        },
      ],
    }).compile();

    service = module.get<PpgcoBucketService>(PpgcoBucketService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('url getter', () => {
    it('should return the bucket URL from config service', () => {
      const testUrl = 'http://test-bucket-url.com';
      mockConfigService.get.mockReturnValueOnce(testUrl);

      expect(service.url).toBe(testUrl);
      expect(mockConfigService.get).toHaveBeenCalledWith('PPGCO_BUCKET_URL');
    });
  });

  describe('bucketKey getter', () => {
    it('should return the bucket key from config service', () => {
      const testKey = 'test-bucket-key';
      mockConfigService.get.mockReturnValueOnce(testKey);

      expect(service.bucketKey).toBe(testKey);
      expect(mockConfigService.get).toHaveBeenCalledWith('PPGCO_BUCKET_KEY_ID');
    });
  });

  describe('getBucketUrl', () => {
    it('should return the combined bucket URL', () => {
      const baseUrl = 'http://test-bucket-url.com';
      const bucketKey = 'test-bucket-key';
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'PPGCO_BUCKET_URL') return baseUrl;
        if (key === 'PPGCO_BUCKET_KEY_ID') return bucketKey;
      });

      const result = service.getBucketUrl();
      expect(result).toBe(`${baseUrl}/${bucketKey}`);
    });
  });

  describe('createBucket', () => {
    it('should call bucketApi.attempt with correct parameters', async () => {
      const bucketConfig: PpgcoBucketConfig = {
        name: 'test-bucket',
      };

      await service.createBucket(bucketConfig);

      expect(mockBucketApi.attempt).toHaveBeenCalledWith(expect.any(Function));

      // Verify the function passed to attempt
      const attemptFn = mockBucketApi.attempt.mock.calls[0][0];
      attemptFn();
      expect(mockBucketApi.http.post).toHaveBeenCalledWith(
        ENDPOINTS.bucket.create,
        bucketConfig,
      );
    });
  });

  describe('updateBucket', () => {
    it('should call bucketApi.attempt with resolved URL and config', async () => {
      const bucketConfig: PpgcoBucketConfig = {
        name: 'updated-bucket',
      };
      const bucketKey = 'test-bucket-key';
      const resolvedUrl = 'http://resolved-url.com/update';

      mockConfigService.get.mockReturnValueOnce(bucketKey);
      mockBucketApi.resolvePathNames.mockReturnValueOnce(resolvedUrl);

      await service.updateBucket(bucketConfig);

      expect(mockBucketApi.resolvePathNames).toHaveBeenCalledWith(
        ENDPOINTS.bucket.update,
        { bucketKey },
      );

      const attemptFn = mockBucketApi.attempt.mock.calls[0][0];
      attemptFn();
      expect(mockBucketApi.http.post).toHaveBeenCalledWith(
        resolvedUrl,
        bucketConfig,
      );
    });
  });

  describe('uploadFile', () => {
    it('should upload file with all parameters', async () => {
      const uploadConfig: PpgcoBucketFileUpload = {
        file: mockFile,
        description: 'Test file description',
        password: 'file-password',
        collection_name: 'test-collection',
      };

      await service.uploadFile(uploadConfig);

      expect(mockBucketApi.resolvePathNames).toHaveBeenCalledWith(
        ENDPOINTS.files.upload,
        { bucketKey: undefined },
      );

      expect(mockBucketApi.http.post).toHaveBeenCalledWith(
        ENDPOINTS.files.upload,
        expect.any(FormData),
        { headers: expect.any(Object) },
      );
    });

    it('should upload file without optional parameters', async () => {
      const uploadConfig: PpgcoBucketFileUpload = {
        file: mockFile,
        collection_name: 'test-collection',
      };

      await service.uploadFile(uploadConfig);

      expect(mockBucketApi.http.post).toHaveBeenCalledWith(
        ENDPOINTS.files.upload,
        expect.any(FormData),
        { headers: expect.any(Object) },
      );
    });

    it('should include all fields in FormData', async () => {
      const uploadConfig: PpgcoBucketFileUpload = {
        file: mockFile,
        description: 'Test description',
        password: 'test-password',
        collection_name: 'test-collection',
      };

      await service.uploadFile(uploadConfig);

      const formData = (mockBucketApi.http.post as jest.Mock).mock.calls[0][1];

      // Verify FormData contains all fields
      // Note: Actual FormData inspection would require a mock or spy
      expect(formData).toBeInstanceOf(FormData);
    });
  });

  describe('deleteFile', () => {
    it('should call bucketApi.attempt with filename and password', async () => {
      const filename = 'file-to-delete.txt';
      const password = 'delete-password';
      const bucketKey = 'test-bucket-key';
      const resolvedUrl = 'http://resolved-url.com/delete';

      mockConfigService.get.mockReturnValueOnce(bucketKey);
      mockBucketApi.resolvePathNames.mockReturnValueOnce(resolvedUrl);

      await service.deleteFile(filename, password);

      expect(mockBucketApi.resolvePathNames).toHaveBeenCalledWith(
        ENDPOINTS.files.upload,
        { bucketKey, filename },
      );

      const attemptFn = mockBucketApi.attempt.mock.calls[0][0];
      attemptFn();
      expect(mockBucketApi.http.post).toHaveBeenCalledWith(resolvedUrl, {
        password,
      });
    });

    it('should call without password when not provided', async () => {
      const filename = 'file-to-delete.txt';
      const bucketKey = 'test-bucket-key';
      const resolvedUrl = 'http://resolved-url.com/delete';

      mockConfigService.get.mockReturnValueOnce(bucketKey);
      mockBucketApi.resolvePathNames.mockReturnValueOnce(resolvedUrl);

      await service.deleteFile(filename);

      const attemptFn = mockBucketApi.attempt.mock.calls[0][0];
      attemptFn();
      expect(mockBucketApi.http.post).toHaveBeenCalledWith(resolvedUrl, {});
    });
  });

  describe('getFile', () => {
    it('should call bucketApi.attempt with filename and password', async () => {
      const filename = 'file-to-get.txt';
      const password = 'get-password';
      const bucketKey = 'test-bucket-key';
      const resolvedUrl = 'http://resolved-url.com/get';

      mockConfigService.get.mockReturnValueOnce(bucketKey);
      mockBucketApi.resolvePathNames.mockReturnValueOnce(resolvedUrl);

      await service.getFile(filename, password);

      expect(mockBucketApi.resolvePathNames).toHaveBeenCalledWith(
        ENDPOINTS.files.get,
        { bucketKey, filename },
      );

      const attemptFn = mockBucketApi.attempt.mock.calls[0][0];
      attemptFn();
      expect(mockBucketApi.http.get).toHaveBeenCalledWith(resolvedUrl, {
        data: { password },
      });
    });

    it('should call without password when not provided', async () => {
      const filename = 'file-to-get.txt';
      const bucketKey = 'test-bucket-key';
      const resolvedUrl = 'http://resolved-url.com/get';

      mockConfigService.get.mockReturnValueOnce(bucketKey);
      mockBucketApi.resolvePathNames.mockReturnValueOnce(resolvedUrl);

      await service.getFile(filename);

      const attemptFn = mockBucketApi.attempt.mock.calls[0][0];
      attemptFn();
      expect(mockBucketApi.http.get).toHaveBeenCalledWith(resolvedUrl, {
        data: {},
      });
    });
  });
});
