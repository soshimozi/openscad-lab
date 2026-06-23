import { Request, Response } from 'express';


export const getHealth = (req: Request<{ id: string }>, res: Response) => {
  
  res.status(200).json({status: 'ok'});
};
