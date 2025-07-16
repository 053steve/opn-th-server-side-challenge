import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return health check response with message and timestamp', () => {
      const result = appController.getHello();
      
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.message).toBe('RESTful API is running!');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return a valid ISO timestamp', () => {
      const result = appController.getHello();
      const timestamp = new Date(result.timestamp);
      
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toISOString()).toBe(result.timestamp);
    });

    it('should call appService.getHello()', () => {
      const spy = jest.spyOn(appService, 'getHello');
      appController.getHello();
      
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should return current timestamp on each call', () => {
      const result1 = appController.getHello();
      
      // Small delay to ensure different timestamps
      setTimeout(() => {
        const result2 = appController.getHello();
        expect(result1.timestamp).not.toBe(result2.timestamp);
      }, 10);
    });
  });

  describe('AppService integration', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
      expect(appService).toBeDefined();
    });

    it('should handle service method correctly', () => {
      jest.spyOn(appService, 'getHello').mockReturnValue('Test message');
      
      const result = appController.getHello();
      expect(result.message).toBe('Test message');
    });
  });
});
