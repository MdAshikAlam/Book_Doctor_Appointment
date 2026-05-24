import { Request, Response, NextFunction } from 'express';
import indiaData from '../data/india_states_districts.json';

export const getStates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const states = Object.keys(indiaData).sort();

    res.status(200).json({
      status: 'success',
      data: states
    });
  } catch (error) {
    next(error);
  }
};

export const getDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state } = req.query;
    if (!state) {
      return res.status(400).json({
        status: 'error',
        message: 'State is required'
      });
    }

    const districts = (indiaData as Record<string, string[]>)[state as string] || [];

    res.status(200).json({
      status: 'success',
      data: districts.sort()
    });
  } catch (error) {
    next(error);
  }
};
