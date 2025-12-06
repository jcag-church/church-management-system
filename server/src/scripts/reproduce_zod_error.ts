import { checkIn } from '../controllers/attendance.controller';
import { validateResource } from '../middleware/validateResource';
import { checkInSchema } from '../schemas/attendance.schema';
import { Request, Response, NextFunction } from 'express';

const mockRequest = (body: any) => ({
  body,
} as Request);

const mockResponse = () => {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.stringify(data, null, 2));
    return res;
  };
  res.send = (data: any) => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    return res;
  };
  return res as Response;
};

const run = async () => {
  console.log('--- Testing Zod Error ---');
  const req = mockRequest({
    eventId: 'invalid-uuid',
    memberId: 'invalid-uuid',
    date: 'invalid-date',
  });
  const res = mockResponse();

  const middleware = validateResource(checkInSchema);
  const next: NextFunction = () => {
    console.log('Middleware passed, calling controller...');
    checkIn(req, res);
  };

  middleware(req, res, next);
};

run();
