import { Test, TestingModule } from '@nestjs/testing';
import { WweService } from './wwe.service';

describe('WweService', () => {
  let service: WweService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WweService],
    }).compile();

    service = module.get<WweService>(WweService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
