import { Test, TestingModule } from '@nestjs/testing';
import { WweController } from './wwe.controller';

describe('WweController', () => {
  let controller: WweController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WweController],
    }).compile();

    controller = module.get<WweController>(WweController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
