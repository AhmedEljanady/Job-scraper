import { Test, TestingModule } from '@nestjs/testing';
import { WuzzufController } from './wuzzuf.controller';
import { WuzzufService } from './wuzzuf.service';

describe('WuzzufController', () => {
  let controller: WuzzufController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WuzzufController],
      providers: [WuzzufService],
    }).compile();

    controller = module.get<WuzzufController>(WuzzufController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
