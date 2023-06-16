import { Test, TestingModule } from '@nestjs/testing';
import { WuzzufService } from './wuzzuf.service';

describe('WuzzufService', () => {
  let service: WuzzufService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WuzzufService],
    }).compile();

    service = module.get<WuzzufService>(WuzzufService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
