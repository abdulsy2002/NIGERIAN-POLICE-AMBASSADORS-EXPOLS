import { BadRequestException } from '@nestjs/common';
import { getPagination } from './pagination';

describe('getPagination', () => {
  it('uses the bounded default page size', () => {
    expect(getPagination()).toEqual({ page: 1, pageSize: 25, skip: 0, take: 25 });
  });

  it('caps page size and calculates the offset', () => {
    expect(getPagination('3', '500')).toEqual({ page: 3, pageSize: 100, skip: 200, take: 100 });
  });

  it('rejects invalid and excessively deep page requests', () => {
    expect(() => getPagination('0')).toThrow(BadRequestException);
    expect(() => getPagination('10001')).toThrow(BadRequestException);
    expect(() => getPagination('1', '-1')).toThrow(BadRequestException);
  });
});
